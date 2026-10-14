import { ArrowLeft } from "lucide-react";

export default function OtpVerification({
  phone,
  otp,
  onOtpChange,
  onContinue,
  onResend,
  onBack,
}) {
  return (
    <main className="auth-page">
      <div className="phone-shell">
        <div className="status">
          <span>9:41</span>
          <span>▮▮▮ ◉ ▰</span>
        </div>
        <button className="back" aria-label="Back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="auth-copy">
          <h1>6-digit code</h1>
          <p>
            Please enter the code we&apos;ve sent to
            <br />
            <b>+91 {phone}</b>
          </p>
        </div>
        <label className="otp-label" htmlFor="otp-input">Verification code</label>
        <div className="otp-control">
          <div className="otp-slots" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span
                className={index === otp.length && otp.length < 6 ? "otp-slot active" : "otp-slot"}
                key={index}
              >
                {otp[index] || ""}
              </span>
            ))}
          </div>
          <input
            id="otp-input"
            className="otp-input"
            aria-label="Six digit demo code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && otp.length === 6) onContinue();
            }}
          />
        </div>
        <p className="resend">
          Didn&apos;t receive a code? <button onClick={onResend}>Resend</button>
        </p>
        <div className="auth-bottom">
          <button className="primary" onClick={onContinue}>Continue</button>
          <small>Demo only — no SMS is sent and no real OTP is verified.</small>
        </div>
      </div>
    </main>
  );
}
