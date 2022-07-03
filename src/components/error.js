const errorStyles = {
  minHeight: '1.2rem',
  color: 'hsla(9, 80%, 70%, 0.9)',
  marginTop: '3px',
  fontSize: '72%',
};
export function Error({ error }) {
  return <div style={errorStyles}>{error ? error.message : ' '}</div>;
}
