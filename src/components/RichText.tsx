import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { YouTubeEmbed } from './YouTubeEmbed'

type YouTubeBlockFields = {
  blockName?: null | string
  blockType: 'youtube'
  url: string
  caption?: string | null
}

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<YouTubeBlockFields>

const converters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    youtube: ({ node }) => <YouTubeEmbed url={node.fields.url} caption={node.fields.caption} />,
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
