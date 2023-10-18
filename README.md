# wanted-pre-onboarding-backend

## 요구사항 분석

본 과제는 다음과 같은 요구사항을 갖고 있다.

1. 각 레코드가 '채용공고'의 내용을 담고 있는 테이블(이하 "채용공고 테이블")에 새 레코드를 등록/기존 레코드를 수정/삭제할 수 있을 것.

2. 채용공고 테이블의 모든 레코드를 가져올 수 있는 API endpoint를 만들 것.

    - 이때, 가져온 레코드들은 '채용내용' 속성이 **없어야** 한다.

3. 채용공고 테이블의 어느 한 primary key가 주어질 때, 그에 해당하는 레코드의 모든 속성을 가져올 수 있는 API endpoint를 만들 것. 

    - 이때, 그 레코드는 반드시 '채용내용' 속성을 **포함해야** 한다.

    - 선택사항: 그 레코드에는 **그 채용공고가 속한 회사의 다른 채용공고의 id값**을 포함해야 한다.

4. 선택사항: 어떤 문자열이 주어질 때, 채용공고 테이블에서 그 문자열을 포함하는 모든 레코드를 가져올 수 있는 API endpoint를 만들 것.

    - 이때, 가져온 레코드들은 '채용내용' 속성이 **없어야** 한다.

5. 선택사항: DB에 사용자 id와 채용공고 id 쌍의 등록 요청이 들어올 때, 그 쌍의 등록은 단 한 번만 성공할 것.


## 구현 과정

### 기술스택

- 프로그래밍 언어: JavaScript

- 서버: Node.js, Express.js, Nginx

  - 제한된 시간 동안 빠르게 서버를 구현할 수 있는 프레임워크로서 Express.js를 사용하기로 결정했다.

  - 서버를 웹에 배포하는 도구로서 Nginx를 사용하기로 결정했다.

- DB: SQLite

  - 시간이 다소 부족했다는 점, 구현이 간편하고 높은 동시처리 성능이 필요하지 않다는 점을 고려하여 SQLite를 사용하기로 결정했다.

- ORM: Sequelize

  - Sequelize는 간단하게 DB schema를 설계/변경할 수 있는 간편한 CLI 툴을 제공하여 개발기간을 크게 단축할 수 있어 이를 사용하기로 결정했다.

- Unit Test: Jest

  - 러닝커브가 낮고 세팅 과정이 번거롭지 않고 간편하기 때문에 Jest를 사용하기로 결정했다.

- Docker, Docker Compose

  - 서버 환경에 구애받지 않고 `docker-compose up` 커맨드 하나로 간편하게 서버를 실행할 수 있게 하기 위해 Docker, Docker Compose를 사용하기로 결정했다.

### DB schema 설계

크게 `JobAd`, `Company`, `User` 세 개의 모델을 두었고, 추가로 사용자 id와 채용공고 id 쌍의 등록을 위한 `UserJobAd` 모델을 두었다.

1. `JobAd` 모델

    - `id`: primary key. 이 키는 `UserJobAd` 모델의 `jobAdId` 속성에 의해 참조된다.

    - `companyId`: 각 레코드에 회사 정보를 갖는 `Companies` 테이블을 만들고, 그 테이블 내 레코드의 primary key를 참조하는 foreign key로서 이 속성을 추가했다.

    - `content`: 요구사항 중 테이블에서 레코드를 가져올 때 '채용내용' 속성이 포함되거나 배제돼야 하는 요구사항이 있어 이를 위해 이 속성을 추가했다.

    - 그외 채용공고 정보를 상세히 기록할 수 있도록 `position`, `reward`, `skills` 속성도 추가했다.

2. `Company` 모델

    - `id`: primary key. 이 키는 `JobAd` 모델의 `companyId` 속성에 의해 참조된다.

    - 그외 회사 정보를 상세히 기록할 수 있도록 `name`, `location`, `country` 속성도 추가했다.

3. `User` 모델

    - `id`: primary key. 이 키는 `UserJobAd` 모델의 `userId` 속성에 의해 참조된다.

    - 그외 다른 속성은 추가하지 않았다.

4. `UserJobAd` 모델

    - `userId`, `jobAdId`: 각각 `User` 모델의 `id`, `JobAd` 모델의 `id`를 참조하는 foreign key인 동시에 primary key. 이를 통해, 이 테이블은 (`userId`, `jobAdId`) 쌍이 고유한 레코드만 들어올 수 있고 이 쌍이 중복되는 레코드 추가 요청은 제약조건 위반으로 거절된다. (이처럼 서로 다른 두 테이블을 그 테이블 내 속성들이 모두 참조하여 연결하는 테이블을 bridge table이라 한다.)

    - 그외 다른 속성은 추가하지 않았다.

각 schema를 구현하기 위한 Sequlize CLI 커맨드는 각각 다음과 같았다.

```bash
npx sequelize model:generate --name JobAd --attributes companyId:integer,content:text,position:string,reward:integer,skills:string
npx sequelize model:generate --name Company --attributes name:string,location:string,country:string
npx sequelize model:generate --name User
npx sequelize model:generate --name UserJobAd --attributes userId:integer,jobAdId:integer
```

### API endpoint 설계

#### GET `/jobad`

모든 채용공고를 가져오는 endpoint.

요청 파라미터:
- 없음

응답:

- 200: OK. 모든 채용공고를 배열로 리턴. 각 원소는 `content` 속성을 포함하지 않는다.
```json
[    { ...채용공고1... },    { ...채용공고2... },    ...]
```


- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```


#### POST `/jobad`

새로운 채용공고를 등록하는 endpoint.

요청 파라미터:
- Body:

```json
{
  "companyId": 10,
  "position": "Software Engineer",
  "reward": 1000,
  "content": "채용 광고 내용",
  "skills": "Python",
  "companyName": "회사 이름 (회사가 없을 때 생성 시 사용됨)",
  "companyLocation": "회사 위치 (회사가 없을 때 생성 시 사용됨)",
  "companyCountry": "회사의 국가 (회사가 없을 때 생성 시 사용됨)"
}
```

응답:

- 201: 생성 성공. 요청 내용이 그대로 리턴된다. 단, `companyId`와 일치하는 `id`가 `Companies` 테이블에 없다면 새 레코드를 등록하고 그 번호를 `companyId` 속성에 담아 리턴한다.

```json
{
  "id": 1,
  "companyId": 1,
  "position": "Software Engineer",
  "reward": 1000,
  "content": "채용 광고 내용",
  "skills": "Python"
}
```

- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```

#### GET `/jobad/:id`

주어진 ID에 해당하는 채용공고의 `content` 속성을 포함한 상세한 정보를 가져온다. 그 채용공고가 속한 회사의 정보도 가져오고, 그 회사가 올린 다른 채용공고의 ID들도 가져온다.

요청 파라미터:

- `id: 수정할 채용공고의 ID.

응답:

- 200: OK.

```json
{
  "id": 채용공고 ID,
  "position": "채용 포지션",
  "reward": 채용 보상,
  "content": "채용 광고 내용",
  "skills": "필요한 기술",
  "Company": {
    "name": "회사 이름",
    "location": "회사 위치",
    "country": "회사 국가"
  },
  "OtherJobAdIds": ["다른 채용공고 ID1", "다른 채용공고 ID2", ...]
}
```

- 404: 데이터 없음.
```json
{
  "message": "No JobAd record found"
}
```


- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```


#### PUT `/jobad/:id`

주어진 ID에 해당하는 채용공고의 정보를 수정한다.

요청 파라미터:

- `id: 수정할 채용공고의 ID.

- Body:

```json
{
  "position": "수정된 채용 포지션",
  "content": "수정된 채용 광고 내용",
  "skills": "수정된 필요한 기술",
}
```


응답:

- 204: No Content.

- 404: 데이터 없음.
```json
{
  "message": "No record found to update"
}
```


- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```


#### DELETE `/jobad/:id`

주어진 ID에 해당하는 채용공고의 정보를 삭제한다.

요청 파라미터:

- `id: 삭제할 채용공고의 ID.


응답:

- 204: No Content.

- 404: 데이터 없음.
```json
{
  "message": "No record found to delete"
}
```


- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```



#### GET `/search`

검색 키워드를 포함하는 채용공고를 검색하는 endpoint.

요청 파라미터:
- Query:
  - `q`: 검색하려는 문자열. (필수)

응답:
- 200: OK. 검색 결과를 배열로 리턴. 각 원소는 `content` 속성을 포함하지 않는다.

```json
[    { ...회사 정보에 검색 키워드를 포함하는 채용공고들... },    { ...검색 키워드를 포함하는 채용공고들... },    ...]
```

- 400: 잘못된 요청. `q` 파라미터가 제공되지 않은 경우.

```json
{
    "message": "q parameter is required"
}
```

- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```

####  POST `/user-job-ad`

사용자의 채용공고 지원 이력을 등록하는 endpoint.

요청 파라미터:
- Body:

```json
{
    "userId": 5,
    "jobAdId": 1
}
```

응답:

- 201: 생성 성공. 요청 내용이 그대로 리턴된다. 단, `userID`와 일치하는 `id`가 `Users` 테이블에 없다면 새 레코드를 등록하고 그 번호를 `userId` 속성에 담아 리턴한다.
```json
{
    "userId": 1,
    "jobAdId": 1
}
```

- 400: 잘못된 요청. `jobAdId`와 일치하는 `id`가 `JobAds` 테이블에 없는 경우.

```json
{
    "message": "JobAd not found"
}
```

- 500: 서버 내부 오류.

```json
{
    "message": "서버 오류 메시지"
}
```


### 세부 구현 과정

#1, #2: `Dockerfile`, `docker-compose.yml`을 통해 이 서버를 위한 도커 컨테이너를 설정했다. 기본 이미지로 `node:14-slim`를 사용했으며, `package.json`에 Express.js를 추가하여 `/`로 HTTP 접속 시 "Hello World!" 메시지를 리턴하는 웹서버를 구현했다. 이 과정에서 웹 요청이 Nginx를 통하도록 설정했다.

#3, #4: 서버에 Sequelize, SQLite를 설치했다.

#7, #8: Sequelize CLI를 사용해 DB schema를 구현했다.

#9, #10: `/jobad`, `/jobad/:id` API endpoint들에 대한 응답을 `app.js` 파일 내에 구현했다. 

#13, #14: `/user-job-ad` API endpoint에 대한 응답을 `app.js` 파일 내에 구현했다.

#17, #18: `/search` API endpoint에 대한 응답을 `app.js` 파일 내에 구현했다.

#25, #26: `app.js` 파일 내에 구현돼있던 모든 코드를 `controllers/`, `routes/` 디렉토리를 사용하여 리팩토링했다.

#27, #28: Jest를 설치하고, `/user-job-ad`, `/search` API endpoint에 대한 응답을 생성하는 `controllers/` 디렉토리 내 코드들에 대한 테스트코드를 구현했다.

#29, #30: `/jobad`, `/jobad/:id` API endpoint들에 대한 응답을 생성하는 `controllers/` 디렉토리 내 코드들에 대한 테스트코드를 구현했다.


### 서버 설치 및 실행

1. 호스트에 Docker, Docker compose를 설치한다.

2. 레포지토리를 clone한다.

3. 다음 커맨드를 실행한다.
```bash
docker-compose up --build
```

4. 최초 설치 시, migration이 되어 있지 않아 서버 운영에 필요한 DB 파일이 존재하지 않으므로, 다음 커맨드를 실행하여 migration을 실행한다.

```bash
docker-compose exec express-app npx sequelize-cli db:migrate
```


## 프로젝트 소감

- 원티드에 이런 프로그램이 존재한다는 사실을 마감일에 임박해서 알게 되어 급히 과제 프로젝트를 시작해서, 급히 구현하느라 꼼꼼히 생각하지 못한 부분이 많다. 특히 Express.js는 이 과제를 수행하면서 처음 사용해보는데, Docker, Python Flask, SQLAlchemy를 사용해서 이 과제와 거의 비슷한 과제를 이미 구현해본 경험이 있었고 전체적인 프로젝트의 코드 구조는 이와 매우 유사했던 덕분에 다행히 크게 어려움을 느끼지 않고 빠르게 학습하며 전체적인 코드를 구현할 수 있었다.

- Sequelize CLI 툴을 통해 DB schema를 매우 간편하게 구현할 수 있었는데, 여기서 migration이라는 개념을 새로 배울 수 있었다. DB schema의 변경을 시간에 따라 추적해야 할 정도 대규모 프로젝트를 해보지 않아 이 유용함을 지금 완전히 이해할 수는 없지만, git을 통한 코드의 버전관리가 얼마나 강력한지는 현업 근무 경험을 통해 이미 확인했으므로 대충은 알 것 같다. 앞으로 더 큰 프로젝트를 하게 되면 이 개념을 꼭 염두에 둬야 할 것 같다.

- (`userId`, `jobAdId`) 쌍을 중복이 없도록 기록하는 테이블을 어떻게 구현할까 고민하며 관련 정보를 찾다가, 단순히 이들을 모두 primary key로 지정하는 동시에 각각 `User`, `JobAd` 테이블의 `id` 속성을 참조하는 foreign key로 지정하면 해결할 수 있다는 사실을 알게되어 테스트해보고 이러한 schema를 갖는 `UserJobAd` 모델을 추가하여 문제를 해결할 수 있었다. (이처럼 `User` 테이블과 `JobAd` 테이블 사이 다대다 관계를 맺는 것을 관리하기 위한 중간 테이블을 bridge table이라 한다는 사실도 새로 배웠다.)

- 유닛테스트를 구현하기 위해 Jest를 GCP e2 micro 서버에 설치하려고 했는데, 알고 보니 Jest는 상당한 규모의 유닛테스트 패키지여서 GCP e2 micro 서버에는 설치가 잘 안 되는 것 같았다. 그 외에도 전체적인 개발을 GCP e2 micro 서버에 VS code로 원격 접속해서 진행했는데 e2 micro 서버의 리소스 이슈가 있어 수시로 먹통이 되는 상황이 발생했다. 구현 직후 곧바로 docker로 실행해 웹에 배포되는 것을 확인하기 위한 목적이었는데, 지금 생각해보면 꼭 그래야 할 필요는 없는 것 같다. 되도록이면 GCP e2 micro 서버에 직접 접속해서 개발을 진행하는 일은 피해야 할 것 같다.

- Jest는 처음 사용해보지만 C++에서 Catch2를 사용한 유닛테스트 코드를 작성해본 경험은 꽤 있었고, Jest에서 사용되는 테스트 코드의 구성이 이와 많이 유사한 듯해 전체적인 구현 난이도가 크게 어렵게 느껴지지는 않았다. 다만 이 정도 규모의 프로젝트를 위해 이 정도 길이의 테스트 코드를 쓰는 것이 실제로 얼마나 큰 효용이 있는지는 실무 경험을 통해 더 많이 느낄 필요가 있는 것 같다. 현업 근무 기간 동안에도 실제 프로젝트 코드에서 비할 정도로 상당량의 테스트코드를 써보았는데, 근무 기간이 짧다보니 실제 그 테스트코드들이 얼마나 전체 프로젝트에 큰 도움이 되는지를 많이 느낄 기회를 경험해보지 못해서 아쉽다.

