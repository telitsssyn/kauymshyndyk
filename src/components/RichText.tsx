import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import type { Media } from '@/payload-types'

import { BibleQuote } from './BibleQuote'
import { PayloadImage } from './PayloadImage'
import { YouTubeEmbed } from './YouTubeEmbed'

type YouTubeBlockFields = {
  blockName?: null | string
  blockType: 'youtube'
  url: string
  caption?: string | null
}

type BibleQuoteBlockFields = {
  blockName?: null | string
  blockType: 'bibleQuote'
  text: string
  reference: string
}

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<YouTubeBlockFields>
  | SerializedBlockNode<BibleQuoteBlockFields>

const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Картинки в тексте — через PayloadImage: стандартный вывод подставляет на
  // телефонах миниатюру 400×300, обрезанную до 4:3, и у схем срезаются края
  upload: (args) => {
    const media = args.node.relationTo === 'media' ? (args.node.value as Media | number) : null
    if (typeof media === 'object' && media?.mimeType?.startsWith('image/')) {
      return (
        <figure className="my-6">
          <PayloadImage
            media={media}
            uncropped
            sizes="(min-width: 768px) 720px, 100vw"
            className="h-auto w-full rounded-2xl"
          />
        </figure>
      )
    }
    const fallback = defaultConverters.upload
    return typeof fallback === 'function' ? fallback(args) : null
  },
  blocks: {
    youtube: ({ node }) => <YouTubeEmbed url={node.fields.url} caption={node.fields.caption} />,
    bibleQuote: ({ node }) => (
      <BibleQuote text={node.fields.text} reference={node.fields.reference} />
    ),
  },
})

type Props = {
  data: DefaultTypedEditorState | null | undefined
  className?: string
}

export function RichText({ data, className = '' }: Props) {
  if (!data) return null
  return <LexicalRichText data={data} converters={converters} className={`prose-church ${className}`} />
}
