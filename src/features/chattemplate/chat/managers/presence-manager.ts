export async function updateProfilePresence(userId: string, isOnline: boolean): Promise<void> {
  try {
    const response = await fetch(`/api/profiles/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: isOnline ? 'online' : 'offline',
        online: isOnline,
        offline: !isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (err) {
    console.error('Failed to update profile presence in database via REST API:', err)
  }
}

