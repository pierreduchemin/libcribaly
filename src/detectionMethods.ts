import * as knownShoteningServices from "./data/knownShoteningServices.json"
import * as popularWebsites from "./data/popularWebsites.json"
import * as suspiciousTld from "./data/suspiciousTld.json"
import levenshtein from 'js-levenshtein'

export async function isIPAddress(href: string): Promise<boolean> {
    const v4 =
        /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/gm
            .test(href)
    if (v4) {
        console.warn("Detected an IPv4 address link: " + href)
        return true
    }
    const v6 =
        /\[(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))]/gm
            .test(href)
    if (v6) {
        console.warn("Detected an IPv6 address link: " + href)
        return true
    }
    return false
}

export async function isShortened(href: string): Promise<boolean> {
    // https://itsjameswhite.medium.com/five-ways-to-check-shortened-links-for-safety-31e8e0dc1865
    // https://safecomputing.umich.edu/be-aware/phishing-and-suspicious-email/shortened-url-security
    // https://github.com/sambokai/ShortURL-Services-List + merge w/ custom list + embed list
    try {
        const url = new URL(href)
        for (let host of knownShoteningServices.values) {
            if (url.hostname.includes(host) && url.pathname !== "/") {
                console.warn("Detected a shotened link: " + href)
                return true
            }
        }
    } catch (error) {
        console.error("isShortened: " + error)
    }
    return false
}

export async function isHyphened(href: string): Promise<boolean> {
    // todo: detect unconventional characters as well using regex
    // https://www.akamai.com/blog/security-research/combosquatting-keyword-analysis-support
    // https://www.akamai.com/fr/blog/security-research/combosquatting-keyword-analysis-support
    try {
        const res = new URL(href).hostname.includes("-")
        if (res) {
            console.warn("Detected a hyphened link: " + href)
        }
        return res
    } catch (error) {
        console.error("isHyphened: " + error)
    }
    return false
}

export async function isFakingDestination(href: string, text: string): Promise<boolean> {
    try {
        const hrefLink = new URL(href)
        const textLink = new URL(text)
        const res = textLink.href !== hrefLink.href
        if (res) {
            console.warn("Detected a fake destination link: " + href)
        }
        return res
    } catch (error) {
        console.error("isFakingDestination: " + error)
        return false
    }
}

export async function isSecretLike(href: string, limit: number = 5): Promise<boolean> {
    if (limit < 1) {
        throw Error("Expected a positive limit parameter")
    }
    let urlChunk = ''
    try {
        let asUrl = new URL(href)
        urlChunk = asUrl.host + asUrl.pathname
    } catch (error) {
        return false
    }
    // detect series of consons or voyels
    const consons = "bcdfghjklmnpqrstvwxz"
    const voyels = "aeiouy"
    let consonsCounter = 0
    let voyelsCounter = 0
    for (let letter of urlChunk) {
        for (let conson of consons) {
            if (letter === conson) {
                consonsCounter++
                voyelsCounter = 0
            }
        }
        for (let voyel of voyels) {
            if (letter === voyel) {
                voyelsCounter++
                consonsCounter = 0
            }
        }
        if (consonsCounter > limit || voyelsCounter > limit) {
            return true
        }
    }
    return false
}

export async function isTyposquatting(href: string, limit: number = 3): Promise<Boolean> {
    // https://blog.cloudflare.com/fr-fr/50-most-impersonated-brands-protect-phishing-fr-fr/
    if (limit < 1) {
        throw Error("Expected a positive limit parameter")
    }
    let distance = -1
    let linkUrl: undefined | URL = undefined
    let popularWebsiteUrl: undefined | URL = undefined
    for (let popularWebsite of popularWebsites.values) {
        try {
            linkUrl = new URL(href)
            popularWebsiteUrl = new URL(popularWebsite)
        } catch (error) {
            console.error("isTyposquatting: " + error)
            return false
        }
        distance = levenshtein(linkUrl.host + linkUrl.pathname, popularWebsiteUrl.host + popularWebsiteUrl.pathname)
        if (distance > 0 && distance < limit) {
            return true
        }
    }
    return false
}

export async function isSuspiciousTLD(href: string): Promise<Boolean> {
    // si le tld est dans la liste des tld suspects
    let linkUrl: undefined | URL = undefined
    for (let tld of suspiciousTld.values) {
        try {
            linkUrl = new URL(href)
        } catch (error) {
            console.error("isSuspiciousTLD: " + error)
            return false
        }
        if (getTLD(linkUrl.hostname) === tld) {
            return true
        }
    }
    return false
}

function getTLD(hostname: string): string {
    let n = hostname.lastIndexOf('.')
    return hostname.substring(n)
}

// export async function isUnknownTLD(href: string): Promise<Boolean> {
//     // https://www.bleepingcomputer.com/news/security/these-are-the-top-level-domains-threat-actors-like-the-most/
//     let linkUrl: undefined | URL = undefined
//     let popularWebsiteUrl: undefined | URL = undefined
//     for (let popularWebsite of popularWebsites.values) {
//         try {
//             linkUrl = new URL(href)
//             popularWebsiteUrl = new URL(popularWebsite)
//         } catch (error) {
//             console.error("isTyposquatting: " + error)
//             return false
//         }

//         // si le site est populaire, mais pas sur le bon tld
//         // if (linkUrl.href === popularWebsite.href &&) {

//         // }
//     }
//     return false
// }

// export async function isTrendingFishing() {
//   // find a list of url online
//   // https://www.urlvoid.com/scan/urlvoid.com/
//   // https://geekflare.com/fr/best-url-scanners/
//   return false
// }


// function suspiciousCharacter()

// https://next.ink/120733/url-avec-attention-aux-arnaques-et-aux-redirections-frauduleuses/