export default async function handler(req, res) {
  const { baseNumber } = req.query
  
  if (!baseNumber) {
    return res.status(400).json({ error: 'baseNumber required' })
  }

  const domain = `https://trgoals${baseNumber}.xyz`
  
  try {
    const response = await fetch(`${domain}/channel.html?id=yayin1`, {
      method: 'HEAD',
      timeout: 5000
    })
    
    if (response.ok) {
      return res.json({ domain, active: true })
    } else {
      return res.json({ domain, active: false })
    }
  } catch (error) {
    return res.json({ domain, active: false })
  }
}