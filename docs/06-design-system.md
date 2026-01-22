# デザインシステム

## 1. デザイン原則

| 原則 | 説明 |
|------|------|
| 清潔感 | オフホワイト背景、余白多め |
| 信頼感 | 電子契約風UI、堅すぎない法務感 |
| 迷わない | 1画面1アクション、明確な導線 |
| コピー最速 | 検索→コピーを1クリックで |

## 2. カラーパレット

### Light Theme

```css
:root {
  /* Background */
  --background: 210 20% 98%;      /* #f8f9fb off-white */
  --foreground: 222 30% 12%;      /* #1a1d24 near-black */

  /* Card */
  --card: 0 0% 100%;              /* #ffffff */
  --card-foreground: 222 30% 12%;

  /* Primary (Accent) */
  --primary: 191 85% 34%;         /* #0d7f94 deep cyan */
  --primary-foreground: 0 0% 100%;

  /* Secondary */
  --secondary: 210 22% 96%;       /* #f1f3f6 */
  --secondary-foreground: 222 22% 18%;

  /* Muted */
  --muted: 210 20% 95%;
  --muted-foreground: 215 16% 40%;

  /* Border */
  --border: 214 18% 88%;          /* #dce0e6 */
  --input: 214 18% 88%;
  --ring: 191 85% 34%;

  /* Destructive */
  --destructive: 0 72% 52%;       /* #e53935 */
  --destructive-foreground: 0 0% 100%;

  /* Radius */
  --radius: 14px;
}
```

### Dark Theme

```css
.dark {
  --background: 222 32% 8%;
  --foreground: 210 20% 96%;
  --card: 222 30% 10%;
  --primary: 191 80% 45%;
  --border: 222 18% 18%;
}
```

## 3. タイポグラフィ

### フォント
```css
font-family: 'Inter', 'Noto Sans JP', sans-serif;
```

### サイズ
| 用途 | サイズ | Weight |
|------|--------|--------|
| H1 | 28px | 600 |
| H2 | 20px | 600 |
| Body | 15px | 400 |
| Small | 13px | 400 |

### 数字
```css
font-variant-numeric: tabular-nums;
```

## 4. スペーシング

```css
:root {
  --page-x: 24px;    /* ページ左右余白 */
  --card-p: 20px;    /* カード内余白 */
  --gap: 16px;       /* グリッド間隔 */
}

@media (max-width: 640px) {
  :root {
    --page-x: 16px;
    --card-p: 16px;
    --gap: 12px;
  }
}
```

## 5. シャドウ

```css
:root {
  --shadow-sm: 0 1px 2px hsl(222 30% 12% / 0.06);
  --shadow-md: 0 6px 18px hsl(222 30% 12% / 0.10);
}
```

**ルール**: 影は薄く、1-2種類に統一

## 6. コンポーネント

### Button

```tsx
// Primary（メインアクション）
<Button>コピー</Button>

// Secondary（サブアクション）
<Button variant="secondary">キャンセル</Button>

// Ghost（アイコンボタン）
<Button variant="ghost" size="icon">
  <Copy className="h-4 w-4" />
</Button>
```

**高さ**: 44px以上（タッチ対応）

### Card

```tsx
<Card className="border shadow-sm">
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
</Card>
```

**独自性**: 検索カードのみ上辺に2pxのアクセントバー

```css
.search-card {
  border-top: 2px solid hsl(var(--primary));
}
```

### Input

```tsx
<div className="space-y-2">
  <Label htmlFor="name">お名前 *</Label>
  <Input id="name" className="h-11" />
</div>
```

**高さ**: 44px

### Stepper（顧客画面）

```tsx
const steps = ['入力', '確認', '同意', '完了'];

<div className="flex items-center gap-2">
  {steps.map((step, i) => (
    <>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        i <= current ? "bg-primary text-white" : "bg-muted"
      )}>
        {i < current ? <Check /> : i + 1}
      </div>
      {i < steps.length - 1 && (
        <div className="w-8 h-0.5 bg-border" />
      )}
    </>
  ))}
</div>
```

### Toast

```tsx
toast({
  title: "URLをコピーしました",
  duration: 3000,
});
```

**位置**: 右下固定

## 7. レイアウト

### 管理画面

```
┌──────────┬────────────────────────┐
│ Sidebar  │        Main           │
│  240px   │      max-w-5xl        │
│          │                       │
└──────────┴────────────────────────┘
```

### 顧客画面

```
┌──────────────────────────────────┐
│           Stepper                │
├──────────────────────────────────┤
│                                  │
│            Card                  │
│          max-w-xl                │
│                                  │
└──────────────────────────────────┘
```

## 8. アニメーション

### コピーボタン
```css
.copy-btn {
  transition: all 150ms ease;
}

.copy-btn:hover {
  background: hsl(var(--accent));
}

.copy-btn.copied {
  color: hsl(var(--primary));
}
```

### トースト
```css
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

## 9. アクセシビリティ

- [ ] コントラスト比 4.5:1 以上
- [ ] タッチターゲット 44px 以上
- [ ] フォーカスリング表示
- [ ] エラーは色＋文言で伝える
