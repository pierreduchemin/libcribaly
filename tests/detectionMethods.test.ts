import * as detectionMethods from "../src/detectionMethods"
import * as popularWebsites from "../src/data/popularWebsites.json"
import { expect, test } from 'vitest'

test('Do not detect popular urls', async () => {
  for (let website of popularWebsites.values) {
    let isIPAddress = await detectionMethods.isIPAddress(website)
    let isShortened = await detectionMethods.isShortened(website)
    let res = isIPAddress || isShortened
    expect(res).toBe(false)
  }
})

// ***isIPAddress***

test('Do not detect if not a url', async () => {
    let res = await detectionMethods.isIPAddress("notalink")
    expect(res).toBe(false)
})

test('Detect just a local ip', async () => {
    let res = await detectionMethods.isIPAddress("192.168.0.1")
    expect(res).toBe(true)
})

test('Detect just a localhost ip', async () => {
    let res = await detectionMethods.isIPAddress("0.0.0.0")
    expect(res).toBe(true)
})

test('Detect ip with http protocol', async () => {
    let res = await detectionMethods.isIPAddress("http://0.0.0.0")
    expect(res).toBe(true)
})

test('Detect ip with http protocol and port', async () => {
    let res = await detectionMethods.isIPAddress("http://0.0.0.0:8080")
    expect(res).toBe(true)
})

test('Detect ip with https protocol', async () => {
    let res = await detectionMethods.isIPAddress("https://0.0.0.0:8080")
    expect(res).toBe(true)
})

test('Detect ip with https protocol and port', async () => {
    let res = await detectionMethods.isIPAddress("https://0.0.0.0:8080")
    expect(res).toBe(true)
})

test('Detect ip with ftp protocol', async () => {
    let res = await detectionMethods.isIPAddress("ftp://0.0.0.0")
    expect(res).toBe(true)
})

test('Detect ip with ftp protocol and port', async () => {
    let res = await detectionMethods.isIPAddress("ftp://0.0.0.0:8080")
    expect(res).toBe(true)
})

test('Do not detect url that looks like ipv6', async () => {
    let res = await detectionMethods.isIPAddress("https://0:0:0:0:0:0:0:1")
    expect(res).toBe(false)
})

test('Detect url to ipv6', async () => {
    let res = await detectionMethods.isIPAddress("http://[0:0:0:0:0:0:0:1]")
    expect(res).toBe(true)
})

test('Detect url to ipv6 with https protocol', async () => {
    let res = await detectionMethods.isIPAddress("https://[0:0:0:0:0:0:0:1]")
    expect(res).toBe(true)
})

test('Detect url to ipv6 with https protocol and port', async () => {
    let res = await detectionMethods.isIPAddress("https://[0:0:0:0:0:0:0:1]:8080")
    expect(res).toBe(true)
})

// ***isShortened***

test('Do not detect if not a url', async () => {
    let res = await detectionMethods.isShortened("notalink")
    expect(res).toBe(false)
})

test('Do not detect if host is not listed', async () => {
    let res = await detectionMethods.isShortened("https://justaregularlink.com/1a2b3c4d")
    expect(res).toBe(false)
})

test('Detect if host is listed', async () => {
    let res = await detectionMethods.isShortened("https://tinyurl.com/1a2b3c4d")
    expect(res).toBe(true)
})

test('Detect if host is listed with subdomain', async () => {
    let res = await detectionMethods.isShortened("https://test.app.link/1a2b3c4d")
    expect(res).toBe(true)
})

test('Do not detect if just host', async () => {
    let res = await detectionMethods.isShortened("https://tinyurl.com")
    expect(res).toBe(false)
})

// ***isHyphened***

test('Do not detect if not a url', async () => {
    let res = await detectionMethods.isHyphened("notalink")
    expect(res).toBe(false)
})

test('Do not detect if not a url with hypen', async () => {
    let res = await detectionMethods.isHyphened("not-a-link")
    expect(res).toBe(false)
})

test('Do not detect if url do not contains hypen', async () => {
    let res = await detectionMethods.isHyphened("http://justaregularlink.com")
    expect(res).toBe(false)
})

test('Do not detect if url do not contains hypen', async () => {
    let res = await detectionMethods.isHyphened("http://justaregularlink.com")
    expect(res).toBe(false)
})

test('Detect if url contains hypen', async () => {
    let res = await detectionMethods.isHyphened("https://just-a-regular-link.com")
    expect(res).toBe(true)
})

test('Detect if url contains hypen with ftp protocol', async () => {
    let res = await detectionMethods.isHyphened("ftp://just-a-regular-link.com")
    expect(res).toBe(true)
})

test('Do not detect if path contains hypen', async () => {
    let res = await detectionMethods.isHyphened("http://justaregularlink.com/with-hyphens")
    expect(res).toBe(false)
})

test('Detect if url contains hypen with ftp protocol', async () => {
    let res = await detectionMethods.isHyphened("http://with-hyphens.justaregularlink.com")
    expect(res).toBe(true)
})

// ***isFakingDestination***

test('Do not detect if href and text are not urls', async () => {
    let res = await detectionMethods.isFakingDestination("notalink/", "notalink/")
    expect(res).toBe(false)
})

test('Do not detect if text is not a url', async () => {
    let res = await detectionMethods.isFakingDestination("https://justaregularlink.com/", "notalink/")
    expect(res).toBe(false)
})

test('Do not detect if url displayed is the same as the linked one', async () => {
    let res = await detectionMethods.isFakingDestination("https://justaregularlink.com/", "https://justaregularlink.com/")
    expect(res).toBe(false)
})

test('Do not detect if url displayed is the same as the linked one without /', async () => {
    let res = await detectionMethods.isFakingDestination("https://justaregularlink.com/", "https://justaregularlink.com")
    expect(res).toBe(false)
})

test('Detect if url displayed is not the same as the linked one', async () => {
    let res = await detectionMethods.isFakingDestination("https://evilwebsite.net/", "https://justaregularlink.com")
    expect(res).toBe(true)
})

test('Detect if url displayed do not have the same path as the linked one', async () => {
    let res = await detectionMethods.isFakingDestination("https://justaregularlink.com/evilpage/", "https://justaregularlink.com")
    expect(res).toBe(true)
})

test('Detect if url displayed do not have the same path as the linked one without /', async () => {
    let res = await detectionMethods.isFakingDestination("https://justaregularlink.com/evilpage", "https://justaregularlink.com")
    expect(res).toBe(true)
})

test('Detect if url displayed do not have the same subdomain as the linked one', async () => {
    let res = await detectionMethods.isFakingDestination("https://evil.justaregularlink.com/", "https://justaregularlink.com")
    expect(res).toBe(true)
})

// ***isSecretLike***

test('Do not detect if not a url', async () => {
    let res = await detectionMethods.isSecretLike("notalink")
    expect(res).toBe(false)
})

test('Throws error with zero limit parameter', async () => {
    await expect(() => detectionMethods.isSecretLike("https://justaregularlink.com/", 0)).rejects
        .toThrowError(/^Expected a positive limit parameter$/)
})

test('Throws error with negative limit parameter', async () => {
    await expect(() => detectionMethods.isSecretLike("https://justaregularlink.com/", -1)).rejects
        .toThrowError(/^Expected a positive limit parameter$/)
})

test('Detect secret like url, conson based', async () => {
    let res = await detectionMethods.isSecretLike("https://awwwwwwwwebsitewithtoomanyconsons.com/")
    expect(res).toBe(true)
})

test('Detect secret like url, voyel based', async () => {
    let res = await detectionMethods.isSecretLike("https://awebiiiiiiiiitewithtoomanyvoyels.com/")
    expect(res).toBe(true)
})

test('Do not detect almost secret like url', async () => {
    let res = await detectionMethods.isSecretLike("https://ilkjljikljlji.com/")
    expect(res).toBe(false)
})

test('Do not detect if link is not a url', async () => {
    let res = await detectionMethods.isSecretLike("lkjljkljlj")
    expect(res).toBe(false)
})

test('Detect secret like path', async () => {
    let res = await detectionMethods.isSecretLike("https://justaregularlink.com/lkjljkljlj")
    expect(res).toBe(true)
})

// ***isTyposquatting***

test('Do not detect if not a url', async () => {
    let res = await detectionMethods.isTyposquatting("notalink")
    expect(res).toBe(false)
})

test('Do not detect regular domains', async () => {
    let res = await detectionMethods.isTyposquatting("https://justaregularlink.com/")
    expect(res).toBe(false)
})

test('Throws error with zero limit parameter', async () => {
    await expect(() => detectionMethods.isTyposquatting("https://justaregularlink.com/", 0)).rejects
        .toThrowError(/^Expected a positive limit parameter$/)
})

test('Throws error with negative limit parameter', async () => {
    await expect(() => detectionMethods.isTyposquatting("https://justaregularlink.com/", -1)).rejects
        .toThrowError(/^Expected a positive limit parameter$/)
})

test('Do not detect popular website domain', async () => {
    let res = await detectionMethods.isTyposquatting("https://mozilla.org/")
    expect(res).toBe(false)
})

test('Detect typosquatting domain changing 1 character', async () => {
    let res = await detectionMethods.isTyposquatting("https://mozllla.org/")
    expect(res).toBe(true)
})

test('Detect typosquatting domain changing 2 characters', async () => {
    let res = await detectionMethods.isTyposquatting("https://mozlllo.org/")
    expect(res).toBe(true)
})

test('Detect typosquatting domain even without trailing /', async () => {
    let res = await detectionMethods.isTyposquatting("https://mozllla.org")
    expect(res).toBe(true)
})

test('Detect typosquatting subdomain', async () => {
    let res = await detectionMethods.isTyposquatting("https://addon.mozilla.org/")
    expect(res).toBe(true)
})

// detect suspicious tld

test('Do not detect if not a url', async () => {
    let res = await detectionMethods.isSuspiciousTLD("notalink")
    expect(res).toBe(false)
})

test('Do not detect regular domains', async () => {
    let res = await detectionMethods.isSuspiciousTLD("https://justaregularlink.ca/")
    expect(res).toBe(false)
})

test('Detect suspicious TLD', async () => {
    let res = await detectionMethods.isSuspiciousTLD("https://mozilla.com/")
    expect(res).toBe(true)
})

// detect unusual character in domain
