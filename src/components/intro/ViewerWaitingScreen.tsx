type ViewerWaitingScreenProps = {
  roomId: string
}

export function ViewerWaitingScreen({ roomId }: ViewerWaitingScreenProps) {
  return (
    <div className="viewer-wait-screen">
      <div className="viewer-wait-card">
        <h1>뷰어 모드</h1>
        <p className="viewer-wait-lead">
          호스트가 이 방에서 게임을 시작하면 같은 화면이 실시간으로 표시됩니다.
        </p>
        <p className="viewer-wait-room">
          Room: <code>{roomId}</code>
        </p>
        <p className="muted viewer-wait-hint">
          URL에 <code>?role=view</code> 가 붙어 있습니다. 조작은 호스트(
          <code>?role=host</code> 또는 <code>role</code> 생략)만 가능합니다.
        </p>
      </div>
    </div>
  )
}
