# 25.03.04.화 TIL 강건준

- 특화주제(핀테크) 관련 정보 서치
  - 주제 : 여행 적금
  - 내용 : 사용자 목적지, 예산, 여행기간을 입력 시 각종 상품 추천
  - 주요 기능
    - 1️⃣ ✈️ 항공권 추천 → 예산 내에서 가능한 최적의 항공권 (LCC, FSC 구분)
    - 2️⃣ 🏨 숙박 추천 → 호텔, 에어비앤비, 호스텔 등 예산에 맞는 옵션
    - 3️⃣ 🍽️ 식비 예상 & 맛집 추천 → 여행지 물가 반영한 1일 평균 식비 & 맛집 추천
    - 4️⃣ 🚗 교통비 예상 → 대중교통 vs 렌트카 비교, 패스 추천 (ex. JR패스)
    - 5️⃣ 🎟️ 관광지 & 액티비티 추천 → 예산 내에서 가능한 관광지 & 투어 추천
    - 6️⃣ 📱 통신비 추천 → 현지 유심 vs eSIM vs 로밍 비교
    - 7️⃣ 💳 환전 & 결제 수단 추천 → 환율 계산 + 카드 vs 현금 최적 비율 추천

<br>

# 25.03.05.수 TIL 강건준

- 금일 진행된 컨설턴트님과의 미팅에서의 피드백을 위한 자료 조사
  - 여행을 위한 자산관리 서비스에 필요한 내용 정리 -> 팀 내 회의결과 기각
- 프로젝트 대주제 픽스
  - 기본 자산관리 기능에 저축도우미 기능 추가
  - 주요 기능 : 저축 도우미
    - 소비한 금액의 일정 퍼센트 또는 설정한 금액만큼 설정 계좌에 저축하는 기능

<br>

# 25.03.06.목 TIL 강건준

- 온라인 강의를 통한 figma wireframe 제작 수강 후 실습
- 여러 은행 웹사이트를 서치하며 ui/ux적인 고민
  - 제주은행 모티브로 제작 예정정

<br>

# 25.03.07.금 TIL 강건준

- 기능명세서 구체화 작업<br>
  ->차후 월요일에 팀원 다 모였을 시 최종 구체화 예정

<br>

# 25.03.10.월 TIL 강건준

- 기능명세서 fix
- 구체화 시킨 기능명세서 기준 figma wireframe 작성 진행
- figma 강의 수강 <br>
  - 그룹화 학습
  - 컴포넌트화 학습

<br>

# 25.03.11.화 TIL 강건준

- 컨설턴트님 미팅 후 기능명세서 및 테마 fix
- 구체화 시킨 기능명세서 기준 figma wireframe 작성 중

<br>

# 25.03.12.수 TIL 강건준

- 현 프로젝트의 핵심 기능중 하나인 강제저축 관련 팀원과의 소통 오류가 있음을 발견
- 다음날 (3.13.목) 오전 스크럼 후 회의를 통하여 기능 통일 예정
- wireframe 공동 목표 채팅방, 소비 유형 검사 / 남음

<br>

# 25.03.13.목 TIL 강건준

- 어제부터 진행한 각 기능에 대한 서비스 플로우에 대하여 팀원과의 소통 및 조율 과정
  - 세세한 디자인부터 시작하여 메인 기능인 저축과 소비에 대한 기능 플로우를 이야기 함.
- 위의 내용을 바탕으로 figma wireframe 대폭 수정 및 팀 docs에 서비스 플로우 페이지 생성

<br>

# 25.03.14.금 TIL 강건준

- 캘린더 관련 회의
- 기존 기능 명세서 대폭 변경
- jira 초기 세팅
- 다음주 프론트 업무 분장

<br>

# 25.03.17.월 TIL 강건준

- front / react 필요 라이브러리 설치
- front / 초기 페이지 링크 연결
- front / 초기 Home Page UI

<br>

# 25.03.18.화 TIL 강건준

### 1. react Header, Footer 화면 고정 방법

```jsx
return (
  <div className="sticky top-0 left-0 text-3xl w-full bg-gradient-to-r from-blue-500 to-blue-800 text-white p-4 shadow-md flex justify-between items-center z-50">
    <p className="text-lg font-bold">TMT</p>
    <Link to="/notification">🔔</Link>
  </div>
);
```

이런 느낌으로 sticky를 쓰던가 또는 **fixed 사용**

단 fixed 사용 시 상단 또는 하단 py-10 등 거리 조절 해줘야함

<br>

# 25.03.19.수 TIL 강건준

### 2. react Link에 props 내리는 방법

- 보통은 라우팅에 props를 내림

```
					<PostDetail
						post={post}
						user={user}
						isLogin={isLogin}
						onUpdatePost={onUpdatePost}
						onDeletePost={onDeletePost}
						onMove={onMove}
						onComment={onComment}
						onLikePost={onLikePost}
					/>
```

- 그러나 Link는 useNavigate를 이용하여 내릴 수 있다

```jsx
  const onPropsHandle = () => {
    nav("/saving/selectAccount", {
      state: { goal, goalPrice, image, startDate, endDate },
    });
  };

  -------------------------------------------------------
  // 받는 곳
  import { useLocation } from "react-router-dom";
  import { useEffect } from "react";

  const SelectAccount = () => {
    const location = useLocation()
    const {goal, goalPrice, image, startDate, endDate} = location.state || {}

    useEffect(() => {
        console.log(goal)
    },[])

    return (
        <div>
            {goal}
        </div>
    );
};

export default SelectAccount;
```

<br>

# 25.03.20.목 TIL 강건준

### 3. tailwindcss / items-center, justify-center

### - items-center : flex 안에서 y 축 센터 배치

### - justify-center : flex 안에서 x 축 센터 배치

<br>

# 25.03.21.금 TIL 강건준

- 중간 발표 평가 대비 준비

<br>

# 25.03.24.월 TIL 강건준

### map 사용법

```
사용법 요약

배열.map((item, index) => {
  return (
    <컴포넌트 key={index} props={item} />
  );
});
```

```
예시 코드

import React from 'react';

const users = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
];

function UserCardList() {
  return (
    <div>
      {users.map(user => (
        <div key={user.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h2>{user.name}</h2>
          <p>Age: {user.age}</p>
        </div>
      ))}
    </div>
  );
}

export default UserCardList;

```

<br>

# 25.03.25.화 TIL 강건준

### react-router-dom - <Link> : 이용 props 내리는 방법

```
★ props 내리는 곳

jsx
          <Link
            to={{
              pathname: "/saving/selectSavingMethod",
              state: body,
            }}
            onClick={() =>
              localStorage.setItem("savingData", JSON.stringify(body))
            }
          >
            확인
          </Link>
```

```
★ props 받는 곳

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SelectSavingMethod = () => {
  const location = useLocation()
  const nav = useNavigate();

  const [data, setData] = useState(location.state || JSON.parse(localStorage.getItem("savingData")));

  useEffect(() => {
    console.log(data)
  }, [])
```

- 로컬스토레지 이용해서 state 전달해야함
- useLocation() 선언을 최상단에 해줘야 에러가 안뜸
  ![alt text](image.png)

<br>

# 25.03.26.수 TIL 강건준

### React - Props, Emit

```
★ 부모 컴포넌트

const ForcedSaving = () => {
  const [method, setMethod] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [savingPercent, setSavingPercent] = useState([]);

  const data = JSON.parse(localStorage.getItem("savingData")) || {};
  const nav = useNavigate();

  const onClickRatio = () => {
    setSelectedMethod(1);
    setMethod("비율");
  };
  const onClickAbsolute = () => {
    setSelectedMethod(0);
    setMethod("절대금액");
  };

  const updatedData = {
    ...data,
    type: false,
    savingType: {
      savingType: selectedMethod,
      absSaving:
        selectedMethod === 0
          ? [{ maxAmount: data.goalPrice, savingAmount: data.goalPrice }]
          : [],
      perSaving:
        selectedMethod === 1
          ? {
              savingPercent: savingPercent, // 자식 컴포넌트에서 받은 데이터
              maxMin: {
                maxAmount: null,
                minAmount: null,
              },
            }
          : {},
    },
  };

  const onGoSelectAccount = () => {
    localStorage.setItem("savingData", JSON.stringify(updatedData));
    nav("/saving/selectAccount");
  };

  return (
    <div>
      <button onClick={onClickRatio}>비율</button>
      <button onClick={onClickAbsolute}>절대 금액</button>

      {selectedMethod === 1 && <ForcedSavingRatio onUpdateSavingPercent={setSavingPercent} />}

      <button onClick={onGoSelectAccount}>선택 완료 & 저축 등록</button>
    </div>
  );
};

```

```
★ 자식 컴포넌트

const ForcedSavingRatio = ({ onUpdateSavingPercent }) => {
  const [food, setFood] = useState(10);
  const [retail, setRetail] = useState(10);
  const [artSports, setArtSports] = useState(10);
  const [education, setEducation] = useState(10);
  const [lodgment, setLodgment] = useState(10);
  const [management, setManagement] = useState(10);
  const [medical, setMedical] = useState(10);
  const [realEstate, setRealEstate] = useState(10);
  const [repairPersonal, setRepairPersonal] = useState(10);
  const [scienceTechnology, setScienceTechnology] = useState(10);

  // 값이 변경될 때 부모 컴포넌트로 데이터 전달
  useEffect(() => {
    onUpdateSavingPercent([
      { percent: food, tag: "음식" },
      { percent: retail, tag: "소매" },
      { percent: artSports, tag: "예술/스포츠" },
      { percent: education, tag: "교육" },
      { percent: lodgment, tag: "숙박" },
      { percent: management, tag: "관리" },
      { percent: medical, tag: "의료" },
      { percent: realEstate, tag: "부동산" },
      { percent: repairPersonal, tag: "수리/개인서비스" },
      { percent: scienceTechnology, tag: "과학/기술" },
    ]);
  }, [food, retail, artSports, education, lodgment, management, medical, realEstate, repairPersonal, scienceTechnology]);

  return (
    <div>
      <label>음식:</label>
      <input type="number" value={food} onChange={(e) => setFood(Number(e.target.value))} />

      <label>소매:</label>
      <input type="number" value={retail} onChange={(e) => setRetail(Number(e.target.value))} />

      {/* 필요한 카테고리 input 추가 */}
    </div>
  );
};

export default ForcedSavingRatio;

```

# 25.03.27.목 TIL 강건준

### react ↔ spring boot axios.post <form>

```
import axios from "axios";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const SelectAccount = () => {
  const nav = useNavigate();

  const [accountList, setAccountList] = useState({ accounts: [] });
  const [selectedAccount, setSelectedAccount] = useState(null);

  const data = JSON.parse(localStorage.getItem("savingData")) || {};

  // 계좌 조회
  const onGetAccountList = () => {
    axios
      .get(import.meta.env.VITE_BASE_URL + "/account", {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((res) => {
        setAccountList(res.data);
        console.log("계좌 리스트 :", accountList);
      })
      .catch((err) => {
        console.log("계좌 리스트 가져오기 에러 :", err);
      });
  };

  // 저축 생성
  const onPostSaving = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // 선택한 계좌 확인
    if (!selectedAccount) {
      console.log("계좌를 선택해주세요!");
      return;
    }

    // 백엔드에서 요구하는 형식에 맞춰 데이터 추가
    formData.append("savingAccountNumber", selectedAccount.accountNumber);
    formData.append("type", data.type); // 강제저축(0) or 공동저축(1)
    // formData.append("spendingAccountNumber", data.spendingAccountNumber || ""); // 빈 문자열이라도 추가

    // savingType을 JSON 문자열로 변환
    formData.append("savingType", JSON.stringify(data.savingType));

    console.log("보낼 데이터 확인:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    axios
      .post(import.meta.env.VITE_BASE_URL + "/saving/choice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      .then((res) => {
        console.log("저축 생성 성공 :", res.data);
        nav("/saving/savingStart");
      })
      .catch((err) => {
        console.error("저축 생성 실패 :", err.response?.data || err);
      });
  };

  const onSelectAccount = (account) => {
    setSelectedAccount((prev) => (prev?.id === account.id ? null : account)); // 선택/해제 토글
  };

  useEffect(() => {
    onGetAccountList();
  }, []);

  useEffect(() => {
    console.log("데이터 :", data);
    console.log("선택된 계좌 :", selectedAccount);
  }, [selectedAccount]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex py-12 bg-blue-400 items-center justify-center mb-10 px-8">
        <div className="flex items-center w-full max-w-screen-lg justify-between text-center">
          {/* 단계 표시 */}
          <span className="text-lg font-bold text-gray-300">
            저축 방식 선택
          </span>
          <div className="flex-1 h-[1px] bg-gray-300 mx-2"></div> {/* 선 */}
          <span className="text-lg font-bold text-gray-300">옵션 선택</span>
          <div className="flex-1 h-[1px] bg-gray-300 mx-2"></div> {/* 선 */}
          <span className="text-lg font-bold text-white">계좌 선택</span>
        </div>
      </div>
      {/* 계좌 선택 영역 */}
      <div className="p-8 w-full mx-auto rounded-[60px] bg-white shadow-lg z-10 -mt-13">
        <div className="flex flex-col items-center">
          <h1 className="bg-blue-100 rounded-2xl px-15 py-2 mb-5 text-2xl font-bold">
            벌금 계좌 선택
          </h1>

          {/* 벌금 계좌 선택 */}
          {accountList.accounts.map((account, index) => {
            const bankWithId = { ...account, id: index };
            return (
              <div
                key={index}
                className={`flex items-center px-5 h-15 text-xl  mt-3 rounded-3xl shadow-lg font-bold ${
                  selectedAccount?.id === bankWithId.id
                    ? "bg-green-100 scale-105"
                    : "bg-blue-200"
                }`}
                onClick={() => onSelectAccount(bankWithId)}
              >
                <div>은행 : {account.bank}</div>
                <div className="ml-10 text-lg">
                  계좌 : {account.accountNumber}
                </div>
              </div>
            );
          })}
          <form
            className="flex items-center px-5 h-10 mt-10 text-xl bg-blue-400 rounded-3xl shadow-xl"
            onSubmit={onPostSaving}
          >
            <button type="submit">선택 완료</button>
          </form>
        </div>
      </div>
      -
    </div>
  );
};

export default SelectAccount;
```

<br>

# 25.03.28.금 TIL 강건준

### swal2 사용법

```
Swal.fire({
  title: '정말 삭제하시겠습니까?',
  text: '삭제하면 복구할 수 없습니다.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: '삭제',
  cancelButtonText: '취소',
}).then((result) => {
  if (result.isConfirmed) {
    // 삭제 로직 실행
    Swal.fire('삭제 완료!', '데이터가 삭제되었습니다.', 'success');
  }
});
-------
Swal.fire({
  title: '닉네임을 입력하세요',
  input: 'text',
  inputPlaceholder: 'ex) ChatGPT짱',
  showCancelButton: true,
}).then((result) => {
  if (result.isConfirmed) {
    console.log('입력된 값:', result.value);
  }
});
-------
import React from 'react';
import Swal from 'sweetalert2';

const DeleteButton = () => {
  const handleDelete = () => {
    Swal.fire({
      title: '정말 삭제할까요?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    }).then((result) => {
      if (result.isConfirmed) {
        // 삭제 로직
        Swal.fire('삭제 완료!', '', 'success');
      }
    });
  };

  return <button onClick={handleDelete}>삭제</button>;
};

export default DeleteButton;

```

<br>

# 25.03.31.월 TIL 강건준

### react 글자 폰트 적용

````
### 1. https://fonts.google.com/

### 2. 원하는 폰트 선택

```bash
npm i @fontsource/diphylleia(선택한 폰트 명)
````

```css
App.css

@import 'tailwindcss';

@import "@fontsource/diphylleia";

body {
  font-family: "Diphylleia"(원하는 폰트 이름), sans-serif;
}
```

<br>

# 25.04.01.화 TIL 강건준

### react-circular-menu

```jsx
react-circular-menu

import {
  CircleMenu,
  CircleMenuItem,
  TooltipPlacement,
} from "react-circular-menu";

export const TestMenuComponent = (props) => {
  return (
    <CircleMenu
      startAngle={-90}
      rotationAngle={360}
      itemSize={2}
      radius={5}
      /**
       * rotationAngleInclusive (default true)
       * Whether to include the ending angle in rotation because an
       * item at 360deg is the same as an item at 0deg if inclusive.
       * Leave this prop for angles other than 360deg unless otherwise desired.
       */
      rotationAngleInclusive={false}
    >
      <CircleMenuItem
        onClick={() => alert("Clicked the item")}
        tooltip="Email"
        tooltipPlacement={TooltipPlacement.Right}
      >
        <MailIcon />
      </CircleMenuItem>
      <CircleMenuItem tooltip="Help">
        <HelpOutlineIcon />
      </CircleMenuItem>
      <CircleMenuItem tooltip="Location">
        <MapIcon />
      </CircleMenuItem>
      <CircleMenuItem tooltip="Info">
        <InfoIcon />
      </CircleMenuItem>
    </CircleMenu>
  );
};
```

<br>

# 25.04.02.수 TIL 강건준

### react-calendar

```bash
npm install react-calendar
```

```jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 스타일

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div>
      <h2>선택한 날짜: {date.toDateString()}</h2>
      <Calendar onChange={setDate} value={date} />
    </div>
  );
};

export default MyCalendar;

```

<br>

# 25.04.03.목 TIL 강건준