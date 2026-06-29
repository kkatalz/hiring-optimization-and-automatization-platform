export const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <>
      <button style={{ float: 'right' }} onClick={onClick}>
        X
      </button>
      <br />
    </>
  );
};
