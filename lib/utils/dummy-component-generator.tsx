interface GeneratedComponent {
  code: string
  props: Record<string, any>
  styleMap: Record<string, any>
}

export function generateDummyComponent(prompt: string, componentName: string): GeneratedComponent {
  // Analyze the prompt to detect features and colors
  const lowerPrompt = prompt.toLowerCase()

  // Detect features
  const hasButton =
    lowerPrompt.includes("button") || lowerPrompt.includes("cta") || lowerPrompt.includes("call-to-action")
  const hasTitle = lowerPrompt.includes("title") || lowerPrompt.includes("heading") || lowerPrompt.includes("name")
  const hasPrice = lowerPrompt.includes("price") || lowerPrompt.includes("pricing") || lowerPrompt.includes("cost")
  const hasList = lowerPrompt.includes("list") || lowerPrompt.includes("feature")
  const hasImage = lowerPrompt.includes("image") || lowerPrompt.includes("icon") || lowerPrompt.includes("photo")
  const hasDescription =
    lowerPrompt.includes("description") || lowerPrompt.includes("text") || lowerPrompt.includes("paragraph")

  // Detect colors
  const colors = {
    primary: "#3b82f6", // blue
    secondary: "#8b5cf6", // purple
    accent: "#06b6d4", // cyan
    text: "#1f2937",
    textLight: "#6b7280",
    background: "#ffffff",
    border: "#e5e7eb",
  }

  if (lowerPrompt.includes("blue")) colors.primary = "#3b82f6"
  if (lowerPrompt.includes("purple")) colors.primary = "#8b5cf6"
  if (lowerPrompt.includes("green")) colors.primary = "#10b981"
  if (lowerPrompt.includes("red")) colors.primary = "#ef4444"
  if (lowerPrompt.includes("orange")) colors.primary = "#f97316"
  if (lowerPrompt.includes("pink")) colors.primary = "#ec4899"

  if (lowerPrompt.includes("gradient")) {
    colors.background = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
  }

  // Generate style map
  const styleMap: Record<string, any> = {
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "400px",
    },
  }

  if (hasTitle) {
    styleMap.title = {
      color: colors.text,
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "8px",
    }
  }

  if (hasPrice) {
    styleMap.price = {
      color: colors.primary,
      fontSize: "36px",
      fontWeight: "800",
      marginBottom: "16px",
    }
  }

  if (hasDescription) {
    styleMap.description = {
      color: colors.textLight,
      fontSize: "14px",
      lineHeight: "1.6",
      marginBottom: "16px",
    }
  }

  if (hasList) {
    styleMap.listItem = {
      color: colors.text,
      fontSize: "14px",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }
    styleMap.checkmark = {
      color: colors.primary,
      fontSize: "16px",
    }
  }

  if (hasButton) {
    styleMap.button = {
      backgroundColor: colors.primary,
      color: "#ffffff",
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      width: "100%",
    }
  }

  // Generate component code
  const code = `
function ${componentName}() {
  const styles = {
    container: ${JSON.stringify(styleMap.container, null, 2)},
    ${hasTitle ? `title: ${JSON.stringify(styleMap.title, null, 2)},` : ""}
    ${hasPrice ? `price: ${JSON.stringify(styleMap.price, null, 2)},` : ""}
    ${hasDescription ? `description: ${JSON.stringify(styleMap.description, null, 2)},` : ""}
    ${hasList ? `listItem: ${JSON.stringify(styleMap.listItem, null, 2)},` : ""}
    ${hasList ? `checkmark: ${JSON.stringify(styleMap.checkmark, null, 2)},` : ""}
    ${hasButton ? `button: ${JSON.stringify(styleMap.button, null, 2)}` : ""}
  };

  return (
    <div style={styles.container}>
      ${hasTitle ? `<h2 style={styles.title}>Premium Plan</h2>` : ""}
      ${hasPrice ? `<div style={styles.price}>$29<span style={{fontSize: '18px', fontWeight: '400'}}>/mo</span></div>` : ""}
      ${hasDescription ? `<p style={styles.description}>Perfect for growing teams and businesses that need advanced features.</p>` : ""}
      ${
        hasList
          ? `
      <div style={{marginBottom: '20px'}}>
        <div style={styles.listItem}>
          <span style={styles.checkmark}>✓</span>
          <span>Unlimited projects</span>
        </div>
        <div style={styles.listItem}>
          <span style={styles.checkmark}>✓</span>
          <span>Advanced analytics</span>
        </div>
        <div style={styles.listItem}>
          <span style={styles.checkmark}>✓</span>
          <span>Priority support</span>
        </div>
        <div style={styles.listItem}>
          <span style={styles.checkmark}>✓</span>
          <span>Custom integrations</span>
        </div>
        <div style={styles.listItem}>
          <span style={styles.checkmark}>✓</span>
          <span>Team collaboration</span>
        </div>
      </div>
      `
          : ""
      }
      ${hasButton ? `<button style={styles.button}>Get Started</button>` : ""}
    </div>
  );
}

window.${componentName} = ${componentName};
`

  // Generate props
  const props: Record<string, any> = {}
  if (hasTitle) props.title = "Premium Plan"
  if (hasPrice) props.price = 29
  if (hasDescription) props.description = "Perfect for growing teams and businesses that need advanced features."
  if (hasButton) props.buttonText = "Get Started"

  return {
    code: code.trim(),
    props,
    styleMap,
  }
}
