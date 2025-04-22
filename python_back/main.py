from turtle import forward
from typing import List
from contextlib import asynccontextmanager
from datetime import datetime
import json
import os
from fastapi.routing import APIRoute
from pydantic import BaseModel
from regex import P
import torch
import faiss
import pickle
import gzip
import numpy as np
from kobert_tokenizer import KoBERTTokenizer
from transformers import BertModel
from fastapi import FastAPI, Query
import logging
import uvicorn
import pandas as pd
import joblib
from pathlib import Path
from typing import Optional
import numpy as np
import torch.nn as nn
from typing import List
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage
from fastapi.responses import JSONResponse

#----------------------------------- 서버 시작전 로딩되는 코드
#-----------------------------------
#-----------------------------------
#-----------------------------------
#-----------------------------------

# 환경변수로드
from dotenv import load_dotenv
load_dotenv()


# 데이터 기본경로
DATA_DIR = "./data"
MODEL_DIR = "./model"
# 서버 디버거
logging.basicConfig(
    level=logging.INFO,  
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# 로드할파일경로
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index.bin")
STORE_NAMES_PATH = os.path.join(DATA_DIR, "store_names.pkl.gz")
CATEGORY_PATH = os.path.join(DATA_DIR, "category_data.pkl.gz")

# 데이터 미리 생성(비동기처리)
index = None
store_names = []
category_dict = {}

# 모델로드
tokenizer = KoBERTTokenizer.from_pretrained('skt/kobert-base-v1', tokenizer_class="KoBERTTokenizer")
model = BertModel.from_pretrained('skt/kobert-base-v1')
kmeans_model = joblib.load("./model/kmeans_model.pkl")
model.eval()


@asynccontextmanager
async def load_dataset(app : FastAPI):
    global index, store_names, category_dict
    
    # 인덱스로딩
    index = faiss.read_index(FAISS_INDEX_PATH)
    logger.info("✅ FAISS 인덱스 로드 완료!")
    # 가게이름로딩
    with gzip.open(STORE_NAMES_PATH, "rb") as f:
        store_names = pickle.load(f)
    logger.info(f"✅ 저장된 가게 개수: {len(store_names)}개")    

    # 가게 카테고리 로딩
    with gzip.open(CATEGORY_PATH, "rb") as f:
        category_dict = pickle.load(f)
    logger.info(f"✅ 저장된 카테고리 개수: {len(category_dict)}개")
    yield
    # 애플리케이션 종료 시 실행할 코드
    print("애플리케이션이 종료되었습니다.")
    
# 임베딩 생성하기(내 텍스트의)
def get_kobert_embeddings(texts):
    inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=64)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].detach().cpu().numpy()
app = FastAPI(lifespan=load_dataset)

#----------------------------------- 기본적인 API 시작하는 부분
#-----------------------------------
#-----------------------------------
#-----------------------------------
#-----------------------------------
#-----------------------------------
#-----------------------------------
#-----------------------------------
# 검색하는 api
@app.get("/search")
async def search_store(query : str = Query(..., description="검색할 매장 이름")):
    # 1. 임베딩 생성하기
    query_embedding = get_kobert_embeddings([query])
    
    # 2. 결과를 정규화하기
    query_embedding_normalization = query_embedding / np.linalg.norm(query_embedding)
    
    # 3. FAISS 검색설정
    k = 1 # 한개만반환
    distance, indice = index.search(query_embedding, k)
    
    # 가장 높은 유사도의 결과 반환
    best_idx = indice[0][0]
    best_store_name = store_names[best_idx]
    best_category = category_dict.get(best_store_name, "None")
    best_score  = float(distance[0][0])
    
    return {
    "query": query,
    "best_match": {
        "store_name": best_store_name,
        "category": best_category,
        "score": best_score
        }
    }
    
    
#-----------------------------------
#-----------------------------------
#-----------------------------------
# 소비습관과 연령대 분석하는 API
# 소비습관 Spring연동을 위한 Base Data 구성하기

# 리스트안에들어있는 데이터의 형식
class Transaction(BaseModel):
    id : int
    amount: int
    createdAt: datetime
    category: str
    item: str

# Json데이터의 형식
class ConsumptionList(BaseModel):
    transactions : List[Transaction]

# # 테스트데이터
# 얘 형식으로 테스트했을때 성공함
# consumption데이터 참고 계좌관련 다 0으로처리                                                                                                   
# json_path = Path("C:/Users/SSAFY/Downloads/consumption_3months.json")
# with open(json_path, "r", encoding="utf-8") as f:
#     json_data = json.load(f)
# data = ConsumptionList(**json_data)

##################################
##################################
################## 모델 전처리와 카테고리 데이터
label_list = ["청년층", "중년층", "중장년층", "장년층", "노년층"]
kmeans_model = joblib.load("./model/kmeans_model.pkl")
tag_df = pd.read_csv("./data/tag_ratio_df.csv")
tag_df = tag_df.rename(columns={"Unnamed: 0": "age_group"})
tag_df = tag_df.set_index("age_group")

class GRUModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(GRUModel, self).__init__()
        self.gru = nn.GRU(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        out, _ = self.gru(x)
        out = self.fc(out[:, -1, :])
        return out
    
from decimal import Decimal, ROUND_HALF_UP

def to_decimal(v):
    return Decimal(str(v)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

#-----------------------------------
#-----------------------------------
#-----------------------------------
# 분석 전처리 및 시작점
@app.post("/sobi-analyze")
async def sobi_analyze(data : ConsumptionList):
    df = pd.DataFrame([t.model_dump() for t in data.transactions])
    print(df)
    df["createdAt"] = pd.to_datetime(df["createdAt"]) # 혹시 모르니 테스트
    # GRU모델을 위한 3달짜리 데이터프레임
    df["year_month"] = df["createdAt"].dt.to_period("M")

    # pivot 테이블 생성
    gru_pivot = df.pivot_table(
        index="year_month",
        columns="category",
        values="amount",
        aggfunc="sum"
    ).fillna(0)
    
    gru_percent = gru_pivot.div(gru_pivot.sum(axis=1), axis=0) * 100
    gru_percent = gru_percent.fillna(0).round(2)

    # 카테고리 순서고정
    CATEGORY_ORDER = ["음식", "과학·기술", "소매", "부동산", "예술·스포츠",
                    "숙박", "수리·개인", "시설관리·임대", "교육", "보건의료"]

    # fillna(0) 이지만 한번더 체크
    for col_name in CATEGORY_ORDER:
        if col_name not in gru_percent.columns:
            gru_percent[col_name] = 0
            
    gru_percent = gru_percent[CATEGORY_ORDER] # 컬럼순서 항상 일치하도록 조정
    
    # 3개월 데이터 이하일경우? 분석 x
    if len(gru_percent) < 3:
        return {"error" : "3개월 이상의 데이터가 필요합니다."}
    
    kmeans_data = df.groupby("category")["amount"].sum()
    vector = kmeans_data.reindex(CATEGORY_ORDER).fillna(0)
    vector = vector / vector.sum() * 100
    
    cluster_age = kmeans_model.predict([vector])[0]
    age_text = label_list[cluster_age]
    age_group_name = tag_df.index[cluster_age]
    age_vector = tag_df.loc[age_group_name]
    diff = (vector - age_vector).round(2)
    result1 = {"style" : f"분석결과 {age_text}소비 패턴에 비교적 가까워요.", "analyze_result": []}

    for cat, delta in diff.items():
        direction = "증가 예정" if delta > 0 else "감소 예정"
        result1["analyze_result"].append({
            "category": cat,
            "diff": round(float(delta), 2),
            "direction": direction
        })
    
    input_size = gru_percent.shape[1]   # 보통 10개
    hidden_size = 32
    output_size = input_size

    model = GRUModel(input_size, hidden_size, output_size)
    model_path = r"./model/best_gru_model.pt"
    model.load_state_dict(torch.load(model_path))
    model.eval()
    X_input = gru_percent.values[-3:]  # shape: (3, 10)
    X_tensor = torch.tensor(X_input[np.newaxis, :, :], dtype=torch.float32)  # shape: (1, 3, 10)
    
    with torch.no_grad():
        prediction = model(X_tensor).numpy()
    
    CATEGORY_ORDER = gru_percent.columns.tolist()
    # 1. 예측 결과 (소수점 2자리 반올림)
    predicted_result = {
        k: to_decimal(v)
        for k, v in zip(CATEGORY_ORDER, prediction[0])
    }
    # 2. 최근 월의 실제 소비 비율
    original_result = {
        k: to_decimal(v)
        for k, v in gru_percent.iloc[-1].items()
    }

    # 3. 변화량 계산 (예측값 - 실제값)
    diff_result = {
        k: to_decimal(predicted_result[k] - original_result[k])
        for k in CATEGORY_ORDER
    }
    
    res_list = []
    for category in CATEGORY_ORDER:
        before = original_result[category]
        after = predicted_result[category]
        delta = diff_result[category]
        direction = "더 소비" if delta > 0 else "덜 소비" if delta < 0 else "변화 없음"

        res_list.append({
            "category": category,
            "원래량": before,
            "예측값": after,
            "변화량": delta,
            "해석": direction
        })

    # ✅ 최종 반환 구조
    # spring에서는 double로 받으쇼 뒤지기싫으면(DTO)
    return {
        "요약": result1["style"],
        "result": res_list
    }



#-----------------------------------
#-----------------------------------
#-----------------------------------
# 분석 전처리 및 시작점
@app.post("/card-recommend")
async def card_recommend(data: ConsumptionList):
    # 분석 위에 처럼 데이터 프레임 받아와서 구성하기
    # pivot table을 통해 요약
    df = pd.DataFrame([t.model_dump() for t in data.transactions])
    df["createdAt"] = pd.to_datetime(df["createdAt"])
    df["year_month"] = df["createdAt"].dt.to_period("M")
    llm_pivot = df.pivot_table(index="year_month", columns="category", values="amount", aggfunc="sum").fillna(0)
    percent = llm_pivot.div(llm_pivot.sum(axis=1), axis=0) * 100
    percent = percent.fillna(0).round(2)
    
    CATEGORY_ORDER = ["음식", "과학·기술", "소매", "부동산", "예술·스포츠",
                "숙박", "수리·개인", "시설관리·임대", "교육", "보건의료"]

    lim_data = df.groupby("category")["amount"].sum()
    vector = lim_data.reindex(CATEGORY_ORDER).fillna(0)
    vector = vector / vector.sum() * 100
    
    # 유저 성향 간단 요약
    user_profile = ", ".join([f"{cat} {val:.1f}%" for cat, val in vector.items() if val > 0])
    
    # 데이터 불러오기
    credits_data = pd.read_json("./data/credit_cards_cleaned_raw.json")
    check_data = pd.read_json("./data/check_cards_cleaned_raw.json")
    # 각각 20개씩 랜덤 샘플링
    credit_sample = credits_data.sample(n=20, random_state=42)
    check_sample = check_data.sample(n=20, random_state=42)
    api_key = os.getenv("OPENAI_API_KEY")
    # 합치기
    all_cards = pd.concat([credit_sample, check_sample]).reset_index(drop=True)
    prompt = PromptTemplate(
        input_variables=["user_profile", "card_list"],
        template="""
        당신은 카드 추천 전문가입니다.
        아래는 사용자의 소비 성향입니다:

        {user_profile}

        다음은 추천 가능한 카드 목록입니다:

        {all_cards}

        사용자에게 적합한 카드 3개를 추천하고, 각 카드에 대한 간단한 설명을 제공해주세요.
        
        단 신용카드, 체크카드 별로 나누어 설명하세요.
        내가 제공한 카드 데이터를 반드시 참고하여 그 안에서 추천하세요.
        한글로 답하지말고 card_name, card_type, benefit, image_url 이런필드로 답하세요.
        이미지 링크도 포함해서 제공하세요. 단, 이미지링크는 내가 건네준 카드데이터의 image_url을 그대로 텍스트로 제공할 것, 이미지 링크 하이퍼링크 금지, url텍스트 자체를 반환
        최종응답을 프런트에서 사용가능한 json객체로 반환할 것, 이스케이프 문자(\n, \") 없이 순수 JSON 형태로 응답해줘.
        """
    )
    
    def convert_card_df_to_text(df):
        card_texts = []
        for _, row in df.iterrows():
            card_texts.append(
                f"카드 이름: {row.get('card_name', '알 수 없음')}\n"
                f"카드 타입: {row.get('card_type', '알 수 없음')}\n"
                f"혜택: {row.get('benefits', '없음')}\n"
                f"이미지: {row.get('image_url', '없음')}\n"
            )
        return "\n\n".join(card_texts)
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        api_key=api_key,
        temperature=0.7,
        top_p=0.9
    )
    card_list_text = convert_card_df_to_text(all_cards)

    prompt = prompt.format(user_profile=user_profile, all_cards=card_list_text)
    response = llm.invoke([HumanMessage(content=prompt)])
    parsed_json = json.loads(response.content)
    print(parsed_json)
    final_json = {
        "credit_cards": parsed_json.get("credit_cards", []),
        "check_cards": parsed_json.get("check_cards", [])
    }

    return JSONResponse(content={
        "user_profile": user_profile,
        "recommendation": final_json 
    }, media_type="application/json")


if __name__ == "__main__":
    logger.info("🚀 FastAPI 서버 실행 중...")
    uvicorn.run(app, host="0.0.0.0", port=8100)