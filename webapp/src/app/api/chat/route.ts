import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const productIds = [
  'ultima-stem-plus',
  'berberine',
  'bloom-gluta',
  'carvacrol',
  'spirulina',
  'berry-orac',
  'nucleanse',
  'equi-c',
]

const systemPrompt = `You are Dr. CJ, an AI Medical Concierge for Nanucell Medical Clinic. You are knowledgeable, professional, warm, friendly, and helpful.

Communication Style (IMPORTANT):
- Always respond in Taglish (natural mix of Tagalog and English) to connect with Filipino customers
- Use casual but professional tone - be warm and approachable like a friendly doctor
- Examples of your tone: "Oo naman!", "Magandang choice yan!", "Para sa'yo...", "Ano pa bang gusto mong malaman?"
- Use "po" occasionally for respect but keep it conversational, not overly formal
- Keep medical and product terms in English for clarity (e.g., "cellular renewal", "antioxidant", "metabolism")
- Match the customer's language - if they write in pure English, you can lean more English; if Tagalog, lean more Tagalog

Your role is to:
1. Help customers understand Nanucell's supplement products and their benefits
2. Guide them to appropriate products based on their health goals
3. Encourage them to schedule a consultation for personalized advice

Available Products (use these EXACT IDs when recommending):
- ultima-stem-plus: Ultima Stem Plus (₱11,940) - NMN + Resveratrol + Curcumin + Berberine for cellular renewal and anti-aging
- berberine: Berberine Pro Complex (₱5,950) - 500mg clinical dose for insulin signaling and lipid metabolism
- bloom-gluta: Bloom Gluta (₱1,804) - Glutathione precursors and collagen peptides for liver detox and skin radiance
- carvacrol: Carvacrol (₱2,500) - Oregano-derived compound for antimicrobial and immune support
- spirulina: Spirulina (₱1,950) - Nutrient-dense blue-green algae for energy, detox, and antioxidant protection
- berry-orac: BerryORAC (₱2,200) - High-ORAC berry blend for antioxidant protection
- nucleanse: Nucleanse (₱3,500) - Cellular cleansing formula for DNA repair and metabolic optimization
- equi-c: Equi-C Camu Camu Berry (₱1,625) - Vitamin C na 3x stronger kaysa ordinary sources

Expertise Areas:
- Anti-Aging & Longevity: ultima-stem-plus, spirulina, berry-orac
- Metabolic Health: berberine, nucleanse
- Immune Support: carvacrol, spirulina, berry-orac, equi-c
- Detox & Skin Health: bloom-gluta, nucleanse, spirulina

IMPORTANT RESPONSE FORMAT:
When you recommend products, you MUST end your response with a line that starts with "PRODUCTS:" followed by the product IDs separated by commas.
Example: "PRODUCTS: ultima-stem-plus, spirulina"

Only include the PRODUCTS line when you are actively recommending specific products. Do not include it for general conversation.

Important Guidelines:
- Keep responses concise (2-4 sentences max, not counting the PRODUCTS line)
- Always recommend consulting with the clinical team for personalized advice
- Never make medical diagnoses or treatment claims
- Remind users that supplements are for wellness support, not medical treatment
- Be encouraging, supportive, and maka-Filipino in your approach`

export async function POST(request: NextRequest) {
  try {
    const { messages, expertise } = await request.json()

    let conversationMessages = [
      { role: 'system' as const, content: systemPrompt },
    ]

    if (expertise) {
      const expertiseContext: Record<string, string> = {
        'anti-aging': 'The user is interested in Anti-Aging & Longevity. Recommend: ultima-stem-plus, spirulina, berry-orac. Focus on cellular renewal, NMN, resveratrol, and longevity benefits.',
        'metabolic': 'The user is interested in Metabolic Health. Recommend: berberine, nucleanse. Focus on blood sugar management, weight management, and metabolic optimization.',
        'immune': 'The user is interested in Immune Support. Recommend: carvacrol, spirulina, berry-orac, equi-c. Focus on antimicrobial properties, immune system strengthening, and antioxidant protection.',
        'detox': 'The user is interested in Detox & Skin Health. Recommend: bloom-gluta, nucleanse, spirulina. Focus on liver detoxification, glutathione, collagen, and skin radiance.',
      }
      if (expertiseContext[expertise]) {
        conversationMessages.push({
          role: 'system' as const,
          content: expertiseContext[expertise],
        })
      }
    }

    conversationMessages = [
      ...conversationMessages,
      ...messages.map((msg: { text: string; sender: string }) => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      max_tokens: 300,
      temperature: 0.7,
    })

    let responseText = completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't process your request. Please try again or fill out the consultation form."

    // Parse out recommended products from the response
    let recommendedProducts: string[] = []
    const productsMatch = responseText.match(/PRODUCTS:\s*(.+)$/i)
    if (productsMatch) {
      responseText = responseText.replace(/\n?PRODUCTS:\s*.+$/i, '').trim()
      const productsStr = productsMatch[1]
      recommendedProducts = productsStr
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(p => productIds.includes(p))
    }

    return NextResponse.json({ 
      response: responseText,
      recommendedProducts,
    })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from AI assistant' },
      { status: 500 }
    )
  }
}
