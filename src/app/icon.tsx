import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #17362d 0%, #2f7f7b 100%)',
          color: '#f7f3ec',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        B
      </div>
    ),
    size
  )
}
