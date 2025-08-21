const axios = require('axios');
const OpenAI = require('openai');
const Problem = require('../models/Problem');

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

const getOpenAIClient = () => {
  if (!OPENAI_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }
  return new OpenAI({ apiKey: OPENAI_KEY });
};

async function fetchPageText(url) {
  try {
    const resp = await axios.get(url, {
      timeout: 7000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8',
      },
    });
    const html = resp.data || '';
    const text = html
      .replace(/<script[\s\S]?>[\s\S]?<\/script>/gi, ' ')
      .replace(/<style[\s\S]?>[\s\S]?<\/style>/gi, ' ')
      .replace(/<\/?[^>]+(>|$)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 2000);
  } catch (err) {
    console.warn('fetchPageText failed for', url, err.response?.status || err.message);
    return null;
  }
}

// Get Hint endpoint
exports.getHint = async (req, res) => {
  try {
    console.log('getHint request body:', req.body);
    console.log('getHint user:', req.user);

    const openai = getOpenAIClient();
    let problem = req.body.problem;
    if (!problem && req.body.problemId) {
      console.log('Fetching problem with ID:', req.body.problemId);
      problem = await Problem.findById(req.body.problemId).lean();
      if (!problem) {
        console.log('Problem not found for ID:', req.body.problemId);
        return res.status(404).json({ message: 'Problem not found' });
      }
      if (!req.user || problem.user.toString() !== req.user.id) {
        console.log('Forbidden: User ID:', req.user?.id, 'Problem user:', problem.user);
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (!problem || !problem.title) {
      console.log('Invalid problem data:', problem);
      return res.status(400).json({ message: 'Provide problemId or problem object with title' });
    }

    console.log('Building prompt for problem:', problem.title);
    let prompt = `You are an experienced algorithm tutor. Provide a short helpful hint (2-4 sentences) and then 1-2 short bullets suggesting approaches or data structures. Do NOT provide the full solution or code.

Problem title: ${problem.title}
Difficulty: ${problem.difficulty || 'Unknown'}
Topic: ${problem.topic || 'General'}
Notes: ${problem.notes || ''}`;

    if (req.body.includeLinkText && problem.link) {
      console.log('Fetching page text for link:', problem.link);
      const pageText = await fetchPageText(problem.link);
      if (pageText) {
        prompt += `\n\nPage excerpt (truncated):\n${pageText}`;
      } else {
        prompt += `\n\n(Page excerpt not included — failed to fetch link content or blocked by site.)`;
      }
    }

    console.log('Sending prompt to OpenAI:', prompt);
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful algorithm tutor. Be concise and helpful.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    const hint = response?.choices?.[0]?.message?.content?.trim() ?? 'No hint available';
    console.log('OpenAI response:', hint);
    res.json({ hint });
  } catch (err) {
    console.error('getHint error:', err.message || err);
    return res.status(500).json({ message: 'AI hint failed', error: err.message });
  }
};

// Summarize endpoint
exports.summarize = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text to summarize is required' });
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'Summarize the given text concisely.' },
        { role: 'user', content: `Summarize: ${text.slice(0, 2000)}` },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });
    const summary = response?.choices?.[0]?.message?.content?.trim() ?? 'No summary available';
    res.json({ summary });
  } catch (err) {
    console.error('summarize error:', err.message || err);
    res.status(500).json({ message: err.message });
  }
};