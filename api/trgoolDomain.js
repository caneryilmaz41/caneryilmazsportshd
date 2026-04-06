import { getCachedWorkingTrgoolDomain, getPrimaryTrgoolDomain } from '../trgoolDomains.js'

export default async function handler(req, res) {
  try {
    const domain = await getCachedWorkingTrgoolDomain()
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({ domain })
  } catch {
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({ domain: getPrimaryTrgoolDomain() })
  }
}
