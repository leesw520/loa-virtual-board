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
          뷰어는 조작할 수 없습니다. 관리자 인증 후 방에 들어온 호스트만 게임 상태를 변경할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
