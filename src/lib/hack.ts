
export enum HackType {
    StandardEasy = "StandardEasy",
    StandardNormal = "StandardNormal",
    StandardHard = "StandardHard",
    StandardVeryHard = "StandardVeryHard",
    KaizoBeginner = "KaizoBeginner",
    KaizoIntermediate = "KaizoIntermediate",
    KaizoExpert = "KaizoExpert",
    TASKaizo = "TASKaizo",
    TASPit = "TASPit",
    Troll = "Troll",
}

export interface Hack {
    id: number,
    name: string,
    demo: boolean,
    moderated: boolean,
    added: string,
    featured: boolean,
    exitLength: number,
    hackType: HackType,
    authors: string[],
    rating?: number,
    downloadUrl: string,
    screenshotUrl: string,
    tags?: string[],
}

export interface HackDetails {
    description: string,
    tags: string[],
    screenshot_urls: string[]
}