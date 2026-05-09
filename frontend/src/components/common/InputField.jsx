function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  rightNode,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
      </label>
      <div className="auth-input-wrap">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`auth-input ${error ? "has-error" : ""} ${rightNode ? "has-right-node" : ""}`}
        />
        {rightNode ? <div className="auth-input-right">{rightNode}</div> : null}
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  );
}

export default InputField;
