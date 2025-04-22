# TIL - 신우진



## 2025-03-04
- 병원 방문 및 그랩 코딩테스트 응시
- 집에서 Golang 스터디
    - 대규모 데이터 처리 관련 항상 생각해보는 자세 가지기

## 2025-03-05
- GoLang 공부
    - 대규모 서비스에서 이용하는 채팅서버 목업 구성하기
        - hitURL
            ```Go
            response, err := http.GET("URL")
            ```
            - URL에 대한 접근 시도
            - err반환시 
        - Goroutines
            - 동시성을 보장하는 Goroutines
            - 함수 앞에 go keyword를 붙혀서
            - 주의할점 : main함수 종료시에 같이 종료
                - print문이나 따로 응답 len만큼 무언가 로직이 필요함
        - Channels
            - 각 go routines 끼리 메세지를 전달할 수 있는 큐
            - 서로간의 정보 공유
            - c := make(chan string) 이런식으로 선언
    - 채팅서비스 구조 생성
    ```Go
    //network.go - 서버 기본구조
    package network

    import (
        "log"

        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
    )

    // 프레임워크 이름
    type Network struct {
        engin *gin.Engine
    }

    // 서버생성
    func NewServer()  *Network{
        // &주솟값, * 포인터
        n := &Network{engin : gin.New()}
        n.engin.Use(gin.Recovery())
        n.engin.Use(gin.Logger())
        n.engin.Use(cors.New(cors.Config{
            AllowWebSockets: true,
            AllowOrigins: []string{"*"},
            AllowMethods: []string{"GET", "POST", "PUT"},
            AllowHeaders: []string{"*"},
            AllowCredentials: true,
        }))

        return n
    }

    // 서버 시작
    func (n *Network) StartSever() error{
        log.Println("starting server")
        return n.engin.Run(":8080")
    }

    // socket.go
    // 소켓처리하는 로직과 기본 데이터 구조체

    // 받는메세지
    type message struct {
        Name string
        Message string
        Time int64
    }

    // 클라이언트
    type Client struct {
        Send chan *message
        Room *Room
        Name string
        Socket *websocket.Conn
    }

    // 방
    type Room struct {
        Forward chan *message // 다른클라이언트에게 전송할 것

        Join chan *Client // 소켓 연결되었을때 작동
        Leave chan *Client // 소켓 끊어지면 작동

        Client map[*Client] bool // 방에 있는 사용자 정보
    }
    ```
- 팀단위 미팅 아이디어
    - 자산관리 서비스
        - 캐릭터 추가? 목표 추가?
        - 내가 저축한 금액이 다가올때 애니메이션화, 로드맵화
        - 금액이 목표치에 가까워지면 점점 가까이 오는 물건

## 2025-03-06
- GO공부 하던거 이어서 하기
    - 채팅시 리소스 길이설정
        ```Go
        // types.go
        const (
            SocketBufferSize = 1024
            MessageBufferSize = 256
        )

        // socket.go

        // 방 객체 생성하기
        func NewRoom() *Room {
            return &Room {
                Forward:make(chan *message),
                Join:make(chan, *Client),
                Leave:make(chan *Client),
                Client: make(map[*Client], bool),
            }
        }

        // 서버오픈(메서드)
        func (r * Room) SocketServe(c *gin.Context)  {
            socket, err := Upgrader.Upgrade(c.Writer, c.Request, nil)
            if err != nil {
                panic(err)
            }
            // 쿠키값
            userCookie, err := c.Request.Cookie("auth")
            if err != nil {
                panic(err)
            }
            // 클라이언트생성
            client := &Client{
                Socket: socket,
                Send: make(chan *message, types.MessageBufferSize),
                Room: r,
                Name: userCookie.Value,
            }

            // 연결
            r.Join <- client

            //나가는 처리
            //defer는 함수 종료시에만 실행
            defer func ()  { r.Leave <- client } ()
        }
        ```
    - 내가 사용하던 django와의 차이는 뭘까?
        - django는 Channels와 Customer사용
        - Redis pub/sub 형태 사용
        - 채팅 자체를 저장하는 것이 아니라, 이벤트 자체를 감지해서 각자 Client에게 전송
- 프로젝트관련
    - 기술적인 스택을 어떻게 추가할 것인가?
        - 각자 목표를 잡으면 어떨까
        - 금융권 목표 -> 보안에 좀더 포커스
        - 웹개발자 목표 -> API 사용과 소켓사용 (금융시장 실시간현황)

## 2025-03-07
- Go 공부
    - 프런트엔드 채팅처리
    - 각 채팅마다 프런트엔드에서 클라이언트가 확인 가능하도록 설정
- 프로젝트 관련
    - 기능명세
    - CRUD 위주라는 생각을 계속함
    - 각 팀원들이 어떤 기술스택 가져가면 좋을지 생각
        - 포트폴리오를 위해 --> 금융권 보안로직, 프런트 화면 구성
        - 기술발전을 위해 --> 안써본 기술스택을 프로젝트에 도입해보자.

## 2025-03-10
- 프로젝트 인공지능 도입
    - LangChain
    - 사용할 데이터를 어떻게 할 것인가?
    - 각 은행별, 카드사별 혜택을 웹스크롤링으로 수집하기
    ```python
    import requests
    from bs4 import BeautifulSoup
    import time
    import random
    url = 'https://m.kbcard.com/CRD/DVIEW/MCAM0101'

    for card in card_elements:
    # 카드 이름 추출
    name_tag = card.find('p', class_='card-name')
    card_name = name_tag.text.strip() if name_tag else 'No name found'

    # 카드 이미지 URL 추출
    image_tag = card.find('img', class_='card-img')
    card_image_url = image_tag['src'] if image_tag else 'No image found'

    # 카드 혜택 정보 추출
    benefits_tag = card.find('p', class_='card-benefit')
    card_benefits = benefits_tag.text.strip() if benefits_tag else 'No benefits found'

    # 추출한 정보를 딕셔너리에 저장
    card_info = {
        'name': card_name,
        'image_url': card_image_url,
        'benefits': card_benefits
    }
    cards_info.append(card_info)

    # 요청 간격을 두기 위해 지연 시간을 설정
    time.sleep(random.uniform(1, 3))
    ```
    - 이런느낌으로하면되지않을까..

## 2025-03-11
- LangChain
    - 데이터 수집 방법
        - 1. 스크롤링
        - 2. 직접 수집하기
- 자연어 처리 관련
    - 머신러닝처리방법
    - KGPT
        - 카카오에서 만든 GPT 
        - 소스코드 확인 --> 사업자 등록이 있어야 이용 가능
    - 데이터셋 -> 머신러닝 할 만큼 충분한가? 에 대한 고민이 있음
    - 적은 데이터로도 충분한 성능을 내는 머신러닝 -> Facebook에서 사용하는 모델


## 2025-03-12
- Go에서 메세지 이벤트 관리하기
    - 메서드를 만들어서 for 문으로 case를 분리하고, client라는 변수를 room이라는 걸 포인터해서 r.Client = true, False로 바꿈
    - 메세지 보낼때 << r.Forward
        = for client := range r.Client {
            client.send <- msg 이런식의 구조만 형성
        }
- 인공지능에 대한 고민
    - 처음에는 Go를 통해서 처리속도 이득을 보고싶었음
    - 그러나 HuggingFace등 소스들을 보면서 << 파이썬의 소스가 확실히 방대하다는 것을 느낌
    - 각 언어마다 특화된 분야가 있는데 굳이 내가 변경해야되나? 라는 고민

## 2025-03-13
- 인공지능
    - 데이터셋
    - 처음 시도
        - beautifulsoup으로 처음에 웹 구조를 탐색
        - 그러나 각 사이드마다 구조가 너무 다름
        - 웹 구조체 탐색 -> 웹 크롤링
    - 신한, 우리, KB 등 카드 데이터 크롤링으로 수집 완료
- Django공부
    - 채팅 redis 레이어를 통한 프로세스 통신
    - 프로세스 통신 간에 메모리를 사용할 수 없음
        - redis에서 채널레이어 비동기함수를 통해 소통
    - 웹 소켓 CSRF보안
        - POST요청 시 보통 CSRF토큰을 동시에 보내줌
        - 웹소켓에서는 header를 통해 Origin, Referer헤더를 통해서 보안유지

## 2025-03-14
- 데이터셋 수집
    - 한국소상공인협회 에서 전국 가게명, 분류작업 수행
    - 데이터 전처리, 길이 제한, 중복 제거, NaN값 처리, 컬럼 제거 등
- 알고리즘 공부
    - BFS 복습
        - 백준 토마토 1, 2 복습
- 프로젝트
    - 현직 경험에 있었던 분과 프로젝트 이야기 해봄
    - 금융권 취업을 위해 데이터 무결성 / 세션 어디에 집중해야 하는지?
        - 세션에 집중하는 것도 좋지만 데이터 무결성을 포기해서는 안된다
        - 100만건 중 1건만 실패해도 그 로직 자체를 실패로 보는 경우가 금융권이다.
        - 송금로직, 데이터 로직 등의 무결성에 대해 공부
    - 무결성
        - 데이터의 정확성, 일관성, 신뢰성 유지
        - 무결성 보장
            - 비인가 접근 제한
            - 무결성 제약조건, 규칙 적용
            - 위변조 탐지
            - 무단 데이터 변경 방지하는 규칙과 표준
            - 전체 라이프사이클에서 데이터의 정확성과 일관성 확인
        - 현직 멘토링에서 요즘 금융권에서 spring을 도입하는 경우가 있다고 들음
        - 우리 프로젝트 단계에서 어떤 로직으로 무결성을 보장할것인지
            - @Transcation 어노테이션
            - 혹은 JTA
                - 하나라도 실패하면 전체가 롤백되는 원자성이 중요하다.
                - 분산 트렌잭션이 가능할까?
                - 비관적 락 : 다른 트랜잭션이 계좌를 변경하지 못하도록 막음
                - 낙관적 락 : 계좌 데이터를 가져올때는 업데이트 할 때 버전을 체크

## 2025-03-17
- go 공부
    - 실시간 채팅서비스와 Read -> forward -> write 구조의 서비스 완료
    - 그러나 아직 코드에 대해 이해를 많이 하지는 못함
    - gin, 등등 go web프레임워크 공부 예정
- AI공부
    - 딥러닝보델 KoBERT모델
    - 한국어 버전에 특화된 모델
    - 추후 프로젝트에 활용 예정
    - 기본 환경설정과 github의 에러 등등 참조해서 사용
- 정처기 관련
    - XML
        - 웹 브라우저간 상호작용하기 위한 마크업 언어
    - 제품의 결합도는 낮게 응집도는 높게 해야 좋다.
        - 결합과 응집도 순서 공부

## 2025. 3. 18
- KoBERT 모델 원리에 대해 파악
    - Token 원리
        - LLM에서도 사용하는 글자 토큰
        - 한글의 형태소에 + 헤더에 토크나이저
        - 구글의 토크나이저 원리 공부
        - 한글 파악에 단어 + 조사 + 띄어쓰기 형태로 한글에서 높은 성능을 보임
    - Hugging Face
        - XLNetTokenizer
        - Hugging Face에서 모델 로드하여 사용하는 것으로 결정
- Django 채팅서버
    - 대용량 처리는 어떻게 하는지, go랑 비교하며 채팅서버 구현중

## 2025. 3. 19
- 주어진 환경에서 최선을 다하자
- 문제상황
    - 1. 그래픽카드 지급받지못함
    - 2. 그래서 구글 코랩으로 AI 사용
    - 3. 구글 코랩 결제해서 사용
    - 4. 그러나 문제 발생함
        - 문제 1 : 파일이 너무 커서 한번에 저장하니까 세션이 다운되는 상황
            - 메모리 이슈로 인해 세션이 다운됨
            - 시간복잡도문제 : 180만개 -->> 시간복잡도해결이 필요함
            - 해결 : Batch단위로 프로세스 실행
        - 문제 2 : Batch단위로 해결했지만 마지막 인덱싱과정에서 또 세션이 다운됨
            - 문제가 무엇인가? 3GB 넘어가면 세션이 강제 종료 : RAM 이슈
            - 파일 저장을 1000Batch(1000 * 32) 단위로 저장
        - 문제 3 : 여전히 불러올때 전체 파일이 커서 세션이 다운됨
            - 파일을 Faiss 라이브러리를 통해서 불러와서 이 Faiss의 인덱싱만 저장해서 불러와서 한 파일로 사용
            - 시간복잡도 C++ 기반 라이브러리라서 0.1초단위로 줄일 수 있었음
            - facebook research에서 개발한 클러스터링과 유사도를 구할 때 사용하는 라이브러리, 유클리디안 거리로 반환
        - 문제 4 : 유클리디안 거리를 사용할것인가?
            - 내가 원하는건 KoBert를 사용한 코사인유사도 분석
            - 유클리디안 거리를 어떻게 사용할것인가? 에 대한 고민
            - 정규화를 통해 유클리디안 거리 -> 코사인 유사도 전환해서 사용
            - 일단 정확도는 괜찮은거 같음 -> 자세히 테스트 해보진 않았지만 자료에 있는 음식점과 까페 등등을 잘 추측함 정확도 대부분 0.95 이상

## 2025. 3. 20
- AI 이번주 백엔드 마무리
- FASTAPI
    - FASTAPI 철학에 대해 공부
    - 비동기 통신을 이용해 빠른 처리속도
    - 내가 했던 go 공부 : 비동기 처리속도로 인해 빠름
    - FASTAPI도 마찬가지
    - 이전 FASTAPI는 그냥 def사용해서 간단하게 API처리한다고 생각했음
        - 이번에 공부를 하면서 비동기요청으로 API를 구성하는구나 라는 걸 알았음
        - FASTAPI 홈페이지 공식문서 참고하며 백엔드 환경 구성
            - 서버 시작 전 데이터 로딩으로 빠른 처리
            - 전역적 변수 설정으로 비동기적 변수 처리

## 2025. 3. 21
- Kafka
    - Pub-Sub 모델의 메세지 큐 형식으로 동작함
    - 모든 이벤트 / 데이터의 흐름을 중앙에서 관리하기 위해 링크드인에서 개발
- 메세지큐란?
    - 메세지 큐는 메세지 지향 미들웨어 구현한 시스템
    - 장점 : 비동기, 낮은결합도, 확장성, 탄력성 등
    - 메세지 브로커와 이벤트 브로커가 있음

## 2025. 3. 24
- go 공부
    - 기본 문법 복습
    - if, for, switch
    - 짝 / 홀수 판단 , 계산기, 1부터 100까지 더하기 등 기초적인 문법이 부족한거 같아 문법 공부
- 알고리즘 공부
    - 백준 골드 4 문제 (DFS) 복습
    - 1987번 알파벳 : DFS + 백트래킹으로 해결
- 정보처리기사
    - 정보처리기사 실기 접수 및 실기 공부
    - C++ Swtich 문과 문법에 대해 공부

## 2025. 3. 25
- 인공지능
    - AICE 실습문제풀이
    - 데이터 전처리 및 자격증 대비 공부
- Go 1주차 기본문법공부
    - 기본적인 문법공부
    - go routine 사용과 개념 공부
        - 뛰어난 동시성
        - 2KB 스택 메모리
        - Combined 모델 사용
            - Kernel-level 쓰레드와 User-Level 쓰레드를 혼합하는 방식
    - 스케줄러 공부

## 2025. 3. 26
- 알고리즘 공부
    - 부족하다고 생각한 부분
    - 비트마스킹
        - 비트단위연산
        - 1062 가르침
            - 기본 구상 : set에 기본으로 들어가야하는 단어 넣고
            - 백트래킹(지금은 잘 생각안나서 cob import해서 사용)
            - 동일한 글자 5
            - K-5 일때, K = 0일때 따로 분리만 해주면 정답
- 프로젝트 관리
    - 다음주 일정 설정
    - 현재 일정 점검
    - 이번주 AI완료한거 테스트 후 push하고 서버에서 테스트

## 2025. 3. 27
- 알고리즘 공부
- 백준 문제풀이
```
N = int(input())
M = int(input())

road = [[] for _ in range(N)]
for i in range(N):
    info_list = list(map(int, input().split()))
    for j in range(N):
        if info_list[j] == 1:
            road[i].append(j)

plan = list(map(int, input().split()))
plan = [p - 1 for p in plan]

visited = [False] * N
def dfs(city):
    visited[city] = True
    for neighboor in road[city]:
        if not visited[neighboor]:
            dfs(neighboor)

dfs(plan[0])

if all(visited[city] for city in plan):
    print("YES")
else:
    print("NO")
```

- 여행가는문제
    - 경로 탐색 -> 풀다가 든 의문점 M = int(input()) 변수를 사용안함
    - 정석적인 풀이가 아닌거같음
- 경로 압축 아이디어
    - Union Find
    - 원소를 서로 같은 그룹으로
    ```
    parent = [i for i in range(n + 1)]
    
    def find(parent, x)
        if parent[x] != x:
            parent[x] = find(parent, parent[x])
        return parent[x]
    
    # 그룹만들기
    def union(parent, a, b):
        a = find(parent, a)
        b = find(parent, b)
        if a != b:
            parent[b] = a

    for i in range(1, n + 1):
        connections = list(map(int, input().split()))
        for j in range(1, n + 1):
            if connections[j - 1] == 1:
                union(parent, i, j)
    ```
    - 이런식으로 경로를 압축하는게 정석인 풀이법(구글링)


## 2025. 3. 28
- 알고리즘 공부
    - 컴비네이너티얼 게임 이론
        - 둘이 번갈아 수를 고름
        - 패러티 분석
            - 이기는 턴의 수가 홀수냐 짝수냐
        - 미저 게임
            - 마지막 수를 고른 사람이 패배인 규칙
            - 귀납/패턴분석을 통해 이기는 패턴 분석
- 약수 지우기 게임 1
    - 약수 지울때 1을 떼고 생각
    - 2, 3, 4, 5, .. N 일때
    - 이기는 경우의 수와 지는 경우의 수로 생각
    - 이기는 경우? -> 그 경우의 수에 1을 붙히면 패배
    - 지는 경우의 수 ? -> 그 경우의 수에 1를 붙히면 역시 승리로 바뀜
    - 처음은 트리구조나 다른 시뮬레이션을 생각했지만 이런식으로 생각해 코드를 한줄로 바꿈
    - 1을 제외하고는 A가 항상 유리한 구조

## 2025. 3. 31
- 백준 야구
    - A형에 나오는 야구 게임
    - 생각보다 어렵지 않은 브루트 포스
    - 야구조건대로 조건문 분기하여 처리
    - 시간복잡도?
    - 조합을 활용하여 4번타자 고정 후 처리해줌

## 2025. 4. 01
- 백준 백조의 호수
    - 처음구상
        - deepcopy()로 배열 초기화하면서 풀이
        - 그러나 1500 x 1500에서 메모리 에러
    - 구상 다시하기
        - visited 배열 활용
        - while 문에서 q를 두개 오늘q 내일q 활용해서
            - visited 문 활용
            - 오늘갈수있으면? 오늘 q에 넣고 while문에서 반복
            - 내일 갈 수 있으면 내일 q에 넣고 while문 마지막에 내일 q를 오늘 q로 교체 (Day 증가)
            - 처음 swan 리스트 저장하고 0번과 1번 나눠서 0번을 while문에 1번을 도착점으로
    - 나머지는 BFS활용하여 풀이
- 결합도
    - 모듈의 기능적 독립성은 소프트웨어를 구상하는 각 모듈의 기능이 서로 독립됨
    - 모듈이 하나의 기능만을 수행하고 다른 모듈과의 과도한 상호작용 배제함으로써 이루어짐
    - 모듈의 독립성을 높이기 위해서 결합도는 약하게, 응집도는 강하게 만들어야함
        - 결합도
            - 결합도는 모듈과 모듈 사이의 관련성 의미
            - 관련성이 적을수록 독립성이 높다
            - 자료결합도 -> 스탬프 결합도 -> 제어 결합도 -> 외부 결합도 -> 공통 결합도 -> 내용 결합도
            - 모듈간의 인터페이스로 전달되는 파라미터로만 -> 인터페이스 배열이나 오브젝트, 스트럭쳐 등이 전달 -> 단순 처리할 대상인 값만 전달하는게 아니라 어떻게 처리해야 되는 제어 요소 전달 -> 모듈에서 외부로 선언한 데이터를 다른 모듈에서 참조 및 외부에서 공유 -> 파라미터가 아닌 모듈 밖에서 선언되어 있는 전역변수를 참조하고 전역변수를 갱신 -> 다른 모듈 내부에 있는 변수나 기능을 다른 모듈에서 사용
        - 응집도
            - 응집도는 모듈 내부의 구성요소간의 관계의 인접 정도
            - 기능 -> 순차 -> 통신 -> 절차 -> 시간 -> 논리 -> 우연
            - 모듈 내부의 모든 기능이 단일한 목적을 위해 수행 -> 모듈 내에서 한 활동으로부터 나온 출력값을 다른 활동이 사용 -> 동일한 입력과 출력을 사용하여 다른 기능을 수행하는 활동이 모여 있는 경우 -> 모듈이 다수의 관련 기능을 가질 때, 모듈안의 구성요소들이 그 기능을 순차적으로 수행 -> 연관된 기능이라기보다 특정 시간에 처리되어야하는 활동을 한 모듈에서 처리 -> 유사한 성격을 갖거나 특정 형태로 분류되는 처리 요소들이 한 모듈에서 처리 -> 모듈 내부의 각 구성요소들이 연관이 없는 경우
    - 자 스 제 외 공 내 / 우 논 시 절 통 순 기

## 2025. 4. 02
- 백준 불의 군주 라그나로스
    - 처음 시도해본 플래티넘4 문제
    - 생각보다 어려움 아이디어는 구함 (이기는 수 / 전체 경우의 수)
    - BFS로 모든 경우의 수 탐색하다 보니 시간복잡도 측면에서 문제가 발생
    - 다른 방식으로 재차 나중에 풀이할 예정

## 2025. 4. 03
- 포트폴리오 정리
  - GO기반 -> Python 기반으로 코드 리팩토링
  - 리팩토링 이유
    - 1. 봇 부하
      - 메모리적으로 라이브러리에서 부하 발생
      - 음악 재생 중 -> 음악 예약 -> 예약 대기열 처리하는 과정에서 부하 발생
      - 부하 설정 GO기반 하나의 봇 코드 -> Discord.py / FastAPi 로 분리작업
    - 2. 책임 분리
      - 하나의 코드에서 하나의 역할만 수행
      - 이런 관점에서 코드가 적절하지 않은거 같았음
  - 포폴에 discord 봇 개발일지 작성
  - 추후 LLM(Llama3)로 자동으로 비슷한 장르의 음악 추천
  - 백엔드 서버 분리로 sqlite3 로 사용자의 플레이리스트 기능 만들 예정

## 2025. 4. 04
- Ollma 공부
  - Docker와 연계하여 LLM 모델 컨테이너 화
  - Docker Compose설정 파일 구성해보기
- FastAPI 설정
  - FastAPI 보안설정
  - 무거운 보안설정은 못하지만 기본적인 보안관련 구성요소 확인 후 처리


## 2025. 4. 07
- 매개변수 탐색 알고리즘
    - 머신러닝 모델 성능 최적화 하기 위해 하이퍼파라미터 체계적 조정
        - 그리드 서치 : 가능한 모든 조합 실험
            - 전체 조합 확인으로 최적 조합 놓칠 확률 x
            - 계산량이 폭발적으로 많음
        - 랜덤 서치
            - 하이퍼파라미터 공간에서 무작위로 일부 조합만 선택해 실험
                - 빠르게 괜찮은 성능의 조합 찾음, 운이 없으면 좋은 조합을 놓침
        - 베이지안 최적화
            - 이전 결과를 바탕으로 다음 실험할 하이퍼 파리미터 조합을 점점 더 똑똑하게 선택
            - 적은 실험횟수로 좋은 조합 찾음
            - 구현이 복잡, 특정 라이브러리 사용해야함
        - 진화 알고리즘 / 유전 알고리즘
            - 생물 진화처럼 좋은 조합을 교배하고 돌연변이 시키면서 탐색
            - 복잡한 공간에 강함
            - 튜닝이 어렵고 시간이 오래걸림

## 2025. 4. 08
- 오픈소스
    - django 오픈소스 티켓 해결해봄
    - 리눅스와 window 차이때문에 문법적인 오류 계속 발생 해결
        - 1. 깃허브 cl 오류코드 기반으로 해결
        - 2. 윈도우에서 자동으로 하면 항상 오류를 일으킴
        - 3. ticket에 링크 적고 결과 기다리는중
- 백준
    - 이분탐색 문제풀이
    - 밧줄 문제
        - rope 0으로 나누는 문제만 해결해서 품

## 2025. 4. 09
- 백준 알고리즘
    - 이분탐색 문제풀이
    - 공유기 문제
    - 공유기를 1번 집에 설치했다고 가정하고
        - 그 다음 공유기를 home_list[i] (1 <= i < N) - last_location >= x: 면 count += 1 하고 위치 갱신
        - return count >= C
    - 문제를 좀 이제 어떤 형식으로 푸는지 이해 가능하게됨
- Golang
    - Golang과 리눅스를 같이 공부하며 서버사이드 개발 공부
<<<<<<< TIL/신우진/TIL-WoJin.md
    - 리눅스 명령어위주로 공부함
=======
    - 리눅스 명령어위주로 공부함
>>>>>>> 7632cd5321ede5da1089ee8e06dbf0ec0a4db34b

## 2025. 4. 10
- 알고리즘
    - 뱀 문제
    - 큐에 뱀 좌표를 저장하고 사과가 있으면 꼬리를 appendleft 해서 늘리고 아니면 지우는 문제
    - 처음에 탐색으로 풀다가 시뮬레이션으로 해결
- 오픈소스
    - 관리자와 대화 후 self-assigned로 상태 변경
    - 말투가 좋게 봐주셔서 pr이 받아들여질 가능성 높아보임
>>>>>>> TIL/신우진/TIL-WoJin.md
