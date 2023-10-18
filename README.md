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
