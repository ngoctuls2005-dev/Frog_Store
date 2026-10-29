path = "apps/web/src/styles.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """.frog-ai-fab:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 15px 30px -5px rgba(5, 150, 105, 0.55);
}

.fab-pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  border: 2px solid #34d399;
  opacity: 0;
  animation: fab-pulse 2.5s infinite;
  pointer-events: none;
}

@keyframes fab-pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.15);
    opacity: 0;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.fab-bot-icon {
  animation: fab-bob 3s ease-in-out infinite;
}

@keyframes fab-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}"""

replacement = """.frog-ai-fab:hover,
.frog-ai-fab:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(5, 150, 105, 0.45);
  outline: 2px solid #34d399;
  outline-offset: 2px;
}

/* Eliminate endless pulsating/bobbing animations for a calm user experience */
.fab-pulse-ring {
  display: none;
}

.fab-bot-icon {
  transition: transform 0.2s ease;
}

.frog-ai-fab:hover .fab-bot-icon {
  transform: scale(1.1);
}

/* Accessibility: Support prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .frog-ai-fab,
  .fab-pulse-ring,
  .fab-bot-icon {
    animation: none !important;
    transform: none !important;
  }
}"""

norm_content = content.replace("\r\n", "\n")
norm_target = target.replace("\r\n", "\n")

assert norm_target in norm_content, "target not found!"
norm_content = norm_content.replace(norm_target, replacement.replace("\r\n", "\n"))

with open(path, "w", encoding="utf-8") as f:
    f.write(norm_content)

print("SUCCESS: Removed endless FAB pulse and bobbing, added prefers-reduced-motion!")

