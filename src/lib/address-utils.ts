export function formatFinnishAddress(fullAddress: string | null | undefined): string {
    if (!fullAddress) return ''

    const parts = fullAddress.split(',').map((p: string) => p.trim())
    if (parts.length <= 3) return parts.join(', ')

    // 1. Street
    let street = ''
    if (parts[0].match(/^\d+$/) && parts.length > 1) {
        street = `${parts[1]} ${parts[0]}`
    } else {
        street = parts[0]
    }

    // 2. City
    const cityIdx = parts.findIndex((p: string) =>
        p.toLowerCase() === 'helsinki' ||
        p.toLowerCase() === 'espoo' ||
        p.toLowerCase() === 'vantaa'
    )
    const city = cityIdx !== -1 ? parts[cityIdx] : parts[parts.length - 3] || ''

    // 3. Area
    let area = ''
    if (cityIdx > 1) {
        if (parts.includes('Länsi-Pasila')) {
            area = 'Länsi-Pasila'
        } else {
            area = parts.length > 5 ? parts[cityIdx - 2] : parts[cityIdx - 1]
        }
    }

    return [street, area, city].filter(Boolean).join(', ')
}
