# Asset Requirements Documentation

## 개요

T-Rex Runner 게임의 에셋 시스템은 테마 기반 폴더 구조를 사용하여 재사용 가능하고 확장 가능한 에셋 관리를 제공합니다.

## 폴더 구조

```
extension/
└── assets/
    └── themes/
        └── [theme-name]/
            ├── theme-config.json    # 테마 설정 파일 (필수)
            ├── sprites/
            │   ├── 1x/
            │   │   └── sprite.png   # 1x 스프라이트 시트
            │   └── 2x/
            │       └── sprite.png   # 2x 스프라이트 시트 (레티나 디스플레이용)
            └── sounds/              # 선택적: 사운드 파일들
                ├── press.mp3
                ├── hit.mp3
                └── score.mp3
```

## theme-config.json 스키마

### 필수 필드

```json
{
  "name": "string",           // 테마 이름 (폴더 이름과 일치해야 함)
  "arcadeMode": boolean,      // 아케이드 모드 활성화 여부 (true: 화면 확대, false: 기본 크기)
  "sprites": {
    "1x": "string",           // 1x 스프라이트 이미지 경로 (extension 루트 기준)
    "2x": "string"            // 2x 스프라이트 이미지 경로 (extension 루트 기준)
  },
  "spriteDefinition": {
    "LDPI": {                 // 1x 스프라이트 좌표 정의
      "CACTUS_LARGE": { "x": number, "y": number },
      "CACTUS_SMALL": { "x": number, "y": number },
      "CLOUD": { "x": number, "y": number },
      "HORIZON": { "x": number, "y": number },
      "MOON": { "x": number, "y": number },
      "PTERODACTYL": { "x": number, "y": number },
      "RESTART": { "x": number, "y": number },
      "TEXT_SPRITE": { "x": number, "y": number },
      "TREX": { "x": number, "y": number },
      "STAR": { "x": number, "y": number }
    },
    "HDPI": {                 // 2x 스프라이트 좌표 정의
      // 동일한 구조, 좌표는 2x 스프라이트 시트 기준
    }
  }
}
```

### 선택적 필드

```json
{
  "arcadeMode": false,        // 아케이드 모드 (기본값: false)
                              // true: 게임 시작 시 화면을 확대하여 전체화면 경험 제공
                              // false: 기본 크기로 게임 실행 (확대 없음)
  "sounds": {
    "press": "string",        // 점프 사운드 (data URL 또는 파일 경로)
    "hit": "string",          // 충돌 사운드
    "score": "string"         // 점수 달성 사운드
  }
}
```

## 스프라이트 시트 요구사항

### 이미지 형식
- **형식**: PNG (투명도 지원)
- **1x 스프라이트**: 일반 디스플레이용
- **2x 스프라이트**: 레티나/고해상도 디스플레이용 (1x의 2배 크기)

### 스프라이트 요소

스프라이트 시트에는 다음 요소들이 포함되어야 합니다:

1. **TREX** - 공룡 캐릭터 (다양한 애니메이션 프레임 포함)
2. **CACTUS_SMALL** - 작은 선인장 장애물
3. **CACTUS_LARGE** - 큰 선인장 장애물
4. **PTERODACTYL** - 익룡 장애물 (다양한 높이)
5. **CLOUD** - 배경 구름
6. **HORIZON** - 지평선
7. **MOON** - 달 (야간 모드용, 다양한 위상)
8. **STAR** - 별 (야간 모드용)
9. **TEXT_SPRITE** - 텍스트 및 숫자 스프라이트
10. **RESTART** - 재시작 버튼

### 스프라이트 좌표 계산 방법

1. 이미지 편집기(Photoshop, GIMP 등)에서 스프라이트 시트를 엽니다
2. 각 요소의 왼쪽 상단 모서리 좌표를 확인합니다
3. `x` 좌표: 요소의 왼쪽 가장자리 픽셀 위치
4. `y` 좌표: 요소의 상단 가장자리 픽셀 위치

예시:
```
스프라이트 시트 크기: 2000x150px
TREX 위치: x=848, y=2
→ TREX는 왼쪽에서 848px, 위에서 2px 위치에 시작
```

## 사운드 파일 요구사항

### 형식
- **권장**: MP3 (호환성)
- **대안**: WAV, OGG
- **Base64 인코딩**: data URL로 직접 포함 가능

### 사운드 종류

1. **press** - 점프/버튼 누름 사운드
2. **hit** - 충돌/게임 오버 사운드
3. **score** - 점수 달성/업적 사운드

### 사운드 파일 경로

파일 경로를 사용하는 경우:
```json
{
  "sounds": {
    "press": "assets/themes/default/sounds/press.mp3"
  }
}
```

Base64 data URL을 사용하는 경우:
```json
{
  "sounds": {
    "press": "data:audio/mpeg;base64,T2dnUwAC..."
  }
}
```

## 커스텀 테마 생성 가이드

### 1단계: 폴더 구조 생성

```bash
extension/assets/themes/my-theme/
├── theme-config.json
├── sprites/
│   ├── 1x/
│   │   └── sprite.png
│   └── 2x/
│       └── sprite.png
└── sounds/  # 선택적
    ├── press.mp3
    ├── hit.mp3
    └── score.mp3
```

### 2단계: 스프라이트 시트 준비

1. 기존 스프라이트 시트를 참고하여 동일한 레이아웃으로 새 스프라이트를 만듭니다
2. 각 요소의 크기와 위치를 기존과 동일하게 유지하는 것이 좋습니다
3. 1x와 2x 버전을 모두 준비합니다

### 3단계: theme-config.json 작성

기존 `default` 테마의 `theme-config.json`을 복사하고 다음을 수정:

1. `name` 필드를 새 테마 이름으로 변경
2. `arcadeMode` 설정 (true/false) - 화면 확대 여부 결정
3. `sprites` 경로를 새 테마 폴더에 맞게 수정
4. 스프라이트 좌표가 변경된 경우 `spriteDefinition` 업데이트
5. 사운드 파일 경로 업데이트 (사용하는 경우)

### 4단계: 테마 사용

게임 코드에서 테마를 변경하려면:

```javascript
// index.html 또는 게임 초기화 코드에서
window.assetLoader.loadTheme('my-theme')
  .then(function() {
    // 게임 초기화
    new Runner('.interstitial-wrapper');
  });
```

## 에러 처리

### 기본 테마 Fallback

에셋 로딩 실패 시 시스템은 자동으로 `default` 테마로 fallback합니다:

```javascript
// AssetLoader 내부
.catch(function(error) {
    console.error('Error loading theme config:', error);
    // Fallback to default theme
    if (themeName !== 'default') {
        return self.loadThemeConfig('default');
    }
    throw error;
});
```

### 검증 체크리스트

테마를 생성할 때 다음을 확인하세요:

- [ ] `theme-config.json` 파일이 올바른 JSON 형식인가?
- [ ] 모든 필수 필드가 포함되어 있는가?
- [ ] 스프라이트 이미지 경로가 올바른가?
- [ ] 스프라이트 좌표가 정확한가?
- [ ] 1x와 2x 스프라이트가 모두 존재하는가?
- [ ] 사운드 파일 경로가 올바른가? (사용하는 경우)

## 예제: 커스텀 테마

### 예제 구조

```
extension/assets/themes/kumamon/
├── theme-config.json
├── sprites/
│   ├── 1x/
│   │   └── sprite.png
│   └── 2x/
│       └── sprite.png
└── sounds/
    └── press.mp3
```

### 예제 theme-config.json

```json
{
  "name": "kumamon",
  "arcadeMode": false,
  "sprites": {
    "1x": "assets/themes/kumamon/sprites/1x/sprite.png",
    "2x": "assets/themes/kumamon/sprites/2x/sprite.png"
  },
  "spriteDefinition": {
    "LDPI": {
      "CACTUS_LARGE": { "x": 332, "y": 2 },
      "CACTUS_SMALL": { "x": 228, "y": 2 },
      "CLOUD": { "x": 86, "y": 2 },
      "HORIZON": { "x": 2, "y": 54 },
      "MOON": { "x": 484, "y": 2 },
      "PTERODACTYL": { "x": 134, "y": 2 },
      "RESTART": { "x": 2, "y": 2 },
      "TEXT_SPRITE": { "x": 655, "y": 2 },
      "TREX": { "x": 848, "y": 2 },
      "STAR": { "x": 645, "y": 2 }
    },
    "HDPI": {
      "CACTUS_LARGE": { "x": 652, "y": 2 },
      "CACTUS_SMALL": { "x": 446, "y": 2 },
      "CLOUD": { "x": 166, "y": 2 },
      "HORIZON": { "x": 2, "y": 104 },
      "MOON": { "x": 954, "y": 2 },
      "PTERODACTYL": { "x": 260, "y": 2 },
      "RESTART": { "x": 2, "y": 2 },
      "TEXT_SPRITE": { "x": 1294, "y": 2 },
      "TREX": { "x": 1678, "y": 2 },
      "STAR": { "x": 1276, "y": 2 }
    }
  },
  "sounds": {
    "press": "assets/themes/kumamon/sounds/press.mp3",
    "hit": "data:audio/mpeg;base64,T2dnUwAC...",
    "score": "assets/themes/kumamon/sounds/score.mp3"
  }
}
```

## 참고사항

- 모든 경로는 `extension/` 루트를 기준으로 합니다
- Chrome 확장프로그램에서는 `chrome.runtime.getURL()`을 통해 리소스에 접근합니다
- 스프라이트 좌표는 픽셀 단위입니다
- 2x 스프라이트의 좌표는 1x의 2배가 아닐 수 있습니다 (실제 스프라이트 시트 레이아웃에 따라 다름)
- 사운드 파일은 선택사항이며, 제공하지 않으면 기본 base64 인코딩된 사운드가 사용됩니다

