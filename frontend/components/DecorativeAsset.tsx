import Image from 'next/image'

interface DecorativeAssetProps {
  src: string
  className: string
}

export default function DecorativeAsset({ src, className }: DecorativeAssetProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="decorative-asset"
      className={`pointer-events-none absolute z-0 ${className}`}
    >
      <Image
        src={src}
        alt=""
        role="presentation"
        width={320}
        height={320}
        className="h-auto w-full object-contain"
      />
    </div>
  )
}
