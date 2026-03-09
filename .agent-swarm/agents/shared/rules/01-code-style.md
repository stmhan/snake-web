# 코드 스타일

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스, 컴포넌트, 인터페이스, 타입 | PascalCase | `UserService`, `OrderItem` |
| 함수, 변수, 메서드, 속성 | camelCase | `getUserById`, `isActive` |
| 상수, enum 값 | UPPER_CASE | `MAX_RETRY_COUNT`, `STATUS_ACTIVE` |
| 파일명 (컴포넌트 외) | kebab-case | `date-utils.ts`, `api-client.py` |

불리언 변수와 함수는 `is`, `has`, `should`, `can` 접두사를 사용한다.
이벤트 핸들러는 코드에서 `handle` + 동작, props에서 `on` + 동작으로 명명한다.

## 함수 작성

- 함수 하나가 하나의 작업을 수행한다. 함수 이름만으로 무엇을 하는지 알 수 있어야 한다.
- 10줄을 넘기면 분리를 고려한다.
- 조건 분기는 early return으로 처리한다. 중첩 if/else보다 guard clause가 낫다.
- 매개변수가 3개를 넘으면 객체로 묶는다.

## 포맷팅

- 한 줄은 100자 이내.
- 코드 블록 사이에 빈 줄 하나로 논리 단위를 구분한다.
- 주석은 "무엇"이 아니라 "왜"를 설명한다. 코드만으로 충분히 명확하면 주석을 달지 않는다.

## 금지 사항

- 매직 넘버: 상수로 추출하고 의미 있는 이름을 붙인다.
- 미사용 코드: 주석 처리가 아닌 삭제한다. Git 이력에 남아 있다.
- 축약어 남용: `usr`, `mgr`, `btn` 같은 축약보다 `user`, `manager`, `button`을 쓴다.
