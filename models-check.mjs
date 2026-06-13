// List of known working NVIDIA NIM models
// Try these alternatives:

const NVIDIA_MODELS = [
  // DeepSeek models
  'deepseek-ai/deepseek-r1',
  'deepseek-ai/deepseek-r1-distill-llama-70b',
  
  // Llama models
  'meta/llama3-8b-instruct',
  'meta/llama3-70b-instruct',
  'meta/llama-3.1-8b-instruct',
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.1-405b-instruct',
  
  // NVIDIA optimized models
  'nvidia/llama3-chatqa-1.5-70b',
  'nvidia/nemotron-4-340b-reward',
  
  // Mistral models
  'mistralai/mistral-7b-instruct',
  'mistralai/codestral-22b-instruct'
];

// Update .env with a known working model
console.log('Try updating NVIDIA_NIM_MODEL in .env to one of:');
NVIDIA_MODELS.forEach((m, i) => console.log(`${i+1}. ${m}`));