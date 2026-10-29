# 1. Patch App.tsx
path_app = "apps/web/src/App.tsx"
with open(path_app, "r", encoding="utf-8") as f:
    app_text = f.read()

# Add pendingCheckout state
target_state = "  const [checkoutOpen, setCheckoutOpen] = useState(false)"
replacement_state = """  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [pendingCheckout, setPendingCheckout] = useState(false)"""

norm_app = app_text.replace("\r\n", "\n")
assert target_state in norm_app, "target_state not found!"
norm_app = norm_app.replace(target_state, replacement_state)

# Update onBuyNow handler in FrogDetailPage props
target_buynow = """          onBuyNow={(pid, qty) => {
            runCart(api.add(pid, qty || 1))
            setCheckoutOpen(true)
          }}"""

replacement_buynow = """          onBuyNow={(pid, qty) => {
            runCart(api.add(pid, qty || 1))
            if (!currentUser) {
              setPendingCheckout(true)
              setAuthOpen(true)
              showToast('Vui lòng đăng nhập hoặc đăng ký để kích hoạt gói Bảo Hành Sống 100%!', 'info')
            } else {
              setCheckoutOpen(true)
            }
          }}"""

assert target_buynow in norm_app, "target_buynow not found!"
norm_app = norm_app.replace(target_buynow, replacement_buynow)

# Update handleLogin to trigger pendingCheckout
target_login_toast = """      showToast(`Đăng nhập thành công! Chào mừng ${res.user.full_name || res.user.email}`)
    } catch (err: any) {"""

replacement_login_toast = """      showToast(`Đăng nhập thành công! Chào mừng ${res.user.full_name || res.user.email}`)
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCheckoutOpen(true)
      }
    } catch (err: any) {"""

assert target_login_toast in norm_app, "target_login_toast not found!"
norm_app = norm_app.replace(target_login_toast, replacement_login_toast)

# Update handleRegister to trigger pendingCheckout
target_reg_succ = """      showToast('Đăng ký tài khoản Frog Store thành công!')
    } catch (err: any) {"""

replacement_reg_succ = """      showToast('Đăng ký tài khoản Frog Store thành công!')
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCheckoutOpen(true)
      }
    } catch (err: any) {"""

assert target_reg_succ in norm_app, "target_reg_succ not found!"
norm_app = norm_app.replace(target_reg_succ, replacement_reg_succ)

# Update handleGoogleLogin to trigger pendingCheckout
target_g_succ = """      setAuthOpen(false)
      const updatedCart = await api.cart()
      setCart(updatedCart)"""

replacement_g_succ = """      setAuthOpen(false)
      const updatedCart = await api.cart()
      setCart(updatedCart)
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCheckoutOpen(true)
      }"""

assert target_g_succ in norm_app, "target_g_succ not found!"
norm_app = norm_app.replace(target_g_succ, replacement_g_succ)

# Update guest-lock-banner in drawer to setPendingCheckout
target_lock_btn = """                <button
                  className="btn-lock-auth"
                  onClick={() => {
                    setCartOpen(false)
                    setAuthOpen(true)
                  }}
                >"""

replacement_lock_btn = """                <button
                  className="btn-lock-auth"
                  onClick={() => {
                    setCartOpen(false)
                    setPendingCheckout(true)
                    setAuthOpen(true)
                  }}
                >"""

assert target_lock_btn in norm_app, "target_lock_btn not found!"
norm_app = norm_app.replace(target_lock_btn, replacement_lock_btn)

with open(path_app, "w", encoding="utf-8") as f:
    f.write(norm_app)
print("SUCCESS: Patched App.tsx with pendingCheckout flow!")

# 2. Patch styles.css for mobile layout
path_css = "apps/web/src/styles.css"
with open(path_css, "r", encoding="utf-8") as f:
    css_text = f.read()

target_mobile_chat = """  /* Adjust Chatbot FAB position on mobile to not overlap sticky bar */
  .frog-ai-fab {
    bottom: 74px !important;
    right: 16px !important;
  }

  .frog-ai-chat-panel {
    bottom: 74px !important;
    right: 16px !important;
  }"""

replacement_mobile_chat = """  /* Mobile Chatbot FAB: Compact round button that never blocks content or buy bar */
  .frog-ai-fab {
    bottom: 78px !important;
    right: 16px !important;
    padding: 0 !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    justify-content: center !important;
    box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4) !important;
    z-index: 9990 !important;
  }

  .frog-ai-fab .fab-label,
  .frog-ai-fab .fab-online-dot {
    display: none !important;
  }

  /* Mobile Chat Panel: Bottom sheet modal */
  .frog-ai-chat-panel {
    bottom: 0 !important;
    right: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 82vh !important;
    max-height: 82vh !important;
    border-radius: 20px 20px 0 0 !important;
    z-index: 10001 !important;
  }

  .frog-detail-page {
    padding-bottom: 110px !important;
  }"""

norm_css = css_text.replace("\r\n", "\n")
assert target_mobile_chat in norm_css, "target_mobile_chat not found!"
norm_css = norm_css.replace(target_mobile_chat, replacement_mobile_chat)

with open(path_css, "w", encoding="utf-8") as f:
    f.write(norm_css)
print("SUCCESS: Patched styles.css with compact circular mobile FAB and bottom-sheet panel!")
