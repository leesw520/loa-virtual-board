/** `?role=view` | `viewer` → 읽기 전용. 그 외(미지정·host) → 호스트 */
export function isViewerMode(): boolean {
  const r = new URLSearchParams(window.location.search).get('role')?.toLowerCase()
  return r === 'view' || r === 'viewer'
}
