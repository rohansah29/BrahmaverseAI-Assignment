import { ArrowLeft } from "lucide-react";

export default function PhoneSignUp({
  phone,
  onPhoneChange,
  onContinue,
  onBack,
}) {
  return (
    <main className="auth-page">
      <div className="phone-shell">
        <button className="back" aria-label="Back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="auth-copy">
          <h1>Sign Up to Fastor</h1>
          <p>
            Let us know your mobile number and we will send you an OTP for
            verification.
          </p>
        </div>
        <label className="phone-input">
          <b>+91</b>
          <span className="input-divider" />
          <input
            aria-label="Mobile number"
            inputMode="numeric"
            maxLength={10}
            placeholder="00000 00000"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, ""))}
          />
        </label>
        <div className="auth-bottom">
          <button className="primary" onClick={onContinue}>Get OTP</button>
          <small>
            By clicking, I accept the <b>Terms &amp; Conditions</b> and Privacy
            Policy
          </small>
        </div>
      </div>
    </main>
  );
}
