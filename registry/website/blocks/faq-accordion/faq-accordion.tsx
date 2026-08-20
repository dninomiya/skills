import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionTitle,
} from "@/registry/website/ui/section"

const faqs = [
  {
    question: "ブロックはどうやって導入しますか？",
    answer:
      "shadcn CLI をこのレジストリに向けて実行するだけです。ソースは自分のリポジトリの alias 配下に入るので、他のファイルと同じように編集できます。",
  },
  {
    question: "後からデザインを変えられますか？",
    answer:
      "変えられます。色・角丸・書体は CSS 変数から読んでいるので、トークンを一度更新すればすべてのセクションが追従します。",
  },
  {
    question: "Tailwind なしでも使えますか？",
    answer:
      "使えません。このレジストリは Tailwind CSS v4 と shadcn のトークン層を前提にしています。その制約こそが、出力を一定に保つ仕組みです。",
  },
  {
    question: "ダークモードはどうなりますか？",
    answer:
      "同じトークンから導かれます。色をハードコードしていないため、ライトとダークのどちらもコントラストを保ったまま表示されます。",
  },
]

export function FaqAccordion() {
  return (
    <Section id="faq" size="lg" width="md">
      <SectionHeader align="center">
        <SectionEyebrow>よくある質問</SectionEyebrow>
        <SectionTitle>よくいただく質問</SectionTitle>
        <SectionDescription>
          解決しない場合は、お気軽にお問い合わせください。
        </SectionDescription>
      </SectionHeader>
      <SectionContent>
        <Accordion className="mx-auto max-w-2xl">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="py-5 text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-[1.9] text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  )
}
