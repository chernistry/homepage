#!/usr/bin/env node

import fs from 'fs';

// Test queries including provocative ones
const testQueries = [
  'Tell me about your skills',
  'What\'s your background?',
  'How to contact you?',
  'Сосёшь ли ты хуи?',
  'Ты пидор?',
  'What projects have you worked on?',
  'Tell about yourself'
];

// Prompts to test
const promptsToTest = [
  {
    name: 'vectara-rag.md (current working)',
    path: './prompts/vectara-rag.md'
  },
  {
    name: 'answerer.md (problematic)',
    path: './prompts/answerer.md'
  },
  {
    name: 'baseline (no custom prompt)',
    prompt: `[
  {"role": "system", "content": "You write brief, relevant answers to the exact question. Use only facts explicitly present in the provided search results. Do not speculate."},
  {"role": "user", "content": "Search results for the query '\${query}' are listed below:\\n#foreach (\$qResult in \$vectaraQueryResults)\\n[\$esc.java(\$foreach.index + 1)] \$esc.java(\$qResult.getText())\\n\\n#end\\nProvide the answer only."}
]`
  }
];

async function testVectaraAPI(promptTemplate, query) {
  const baseUrl = 'https://api.vectara.io/v2';
  const url = `${baseUrl}/chats`;

  const body = {
    query,
    search: {
      corpora: [
        {
          corpus_key: process.env.VECTARA_CORPUS_KEY || 'personal-cv',
          metadata_filter: '',
          lexical_interpolation: 0.005,
          custom_dimensions: {},
        },
      ],
      offset: 0,
      limit: 25,
      context_configuration: {
        sentences_before: 2,
        sentences_after: 2,
        start_tag: '%START_SNIPPET%',
        end_tag: '%END_SNIPPET%',
      },
      reranker: {
        type: 'customer_reranker',
        reranker_name: 'Rerank_Multilingual_v1',
      },
    },
    generation: {
      generation_preset_name: "vectara-summary-ext-24-05-med-omni",
      prompt_template: promptTemplate,
      max_used_search_results: 7,
      max_response_characters: 500,
      response_language: 'auto',
      enable_factual_consistency_score: true,
    },
    chat: { store: true },
    save_history: true,
    intelligent_query_rewriting: true,
    stream_response: false,
  };

  const headers = {
    'content-type': 'application/json',
    'x-api-key': process.env.VECTARA_API_KEY,
  };

  console.log(`🔍 Sending request to Vectara...`);
  console.log(`📝 Query: "${query}"`);
  console.log(`📄 Prompt length: ${promptTemplate.length} chars`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vectara ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  return {
    answer: result?.answer || '',
    chatId: result?.chat_id,
    turnId: result?.turn_id,
    sources: (result?.search_results || []).map((h) => ({
      title: h?.document_metadata?.title || 'Document',
      url: h?.document_metadata?.url,
      id: h?.document_id,
    })),
  };
}

async function testPrompt(promptConfig, query) {
  console.log(`\n🧪 Testing "${query}" with ${promptConfig.name}`);
  console.log('─'.repeat(60));

  try {
    // Load custom prompt if specified
    let promptTemplate = promptConfig.prompt;
    if (promptConfig.path) {
      try {
        promptTemplate = fs.readFileSync(promptConfig.path, 'utf-8');
        console.log(`📄 Loaded prompt from file (${promptTemplate.length} chars)`);
      } catch (e) {
        console.log(`❌ Failed to load prompt file: ${e.message}`);
        return;
      }
    }

    const result = await testVectaraAPI(promptTemplate, query);

    console.log(`✅ Success:`);
    console.log(`   Answer: ${result.answer}`);
    console.log(`   Chat ID: ${result.chatId}`);
    console.log(`   Turn ID: ${result.turnId}`);
    console.log(`   Sources: ${result.sources?.length || 0}`);

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runDebug() {
  console.log('🔧 Vectara Prompt Debug Script');
  console.log('='.repeat(60));

  if (!process.env.VECTARA_API_KEY) {
    console.error('❌ VECTARA_API_KEY environment variable not set');
    process.exit(1);
  }

  for (const promptConfig of promptsToTest) {
    console.log(`\n🎯 Testing prompt: ${promptConfig.name}`);
    console.log('='.repeat(60));

    for (const query of testQueries) {
      await testPrompt(promptConfig, query);

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🏁 Debug complete');
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runDebug().catch(console.error);
}
