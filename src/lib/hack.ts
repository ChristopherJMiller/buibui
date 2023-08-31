import { PayloadAction, createSlice } from "@reduxjs/toolkit"

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

export type IdHackDetails = HackDetails & {
    id: number
};

export type CollectedHack = Hack & HackDetails & {
    crc: number,
    coverImageName: string,
};

export interface HackState {
    galleryLoading: boolean,
    galleryStarted: boolean,
    gallery: Hack[],
    galleryDetails: Record<number, IdHackDetails>,
    collectionLoading: boolean,
    collectionLoaded: boolean,
    collection: Record<number, CollectedHack>
}

const initialState: HackState = {
    galleryLoading: false,
    galleryStarted: false,
    gallery: [],
    galleryDetails: {},
    collectionLoading: false,
    collectionLoaded: false,
    collection: {},
}

const hackSlice = createSlice({
    name: 'hacks',
    initialState,
    reducers: {
        markCollectionLoading: (state) => {
            state.collectionLoading = true;
        },
        populateCollection: (state, action: PayloadAction<CollectedHack[]>) => {
            const newCollection: Record<number, CollectedHack> = {};
            action.payload.forEach((hack) => {
                newCollection[hack.id] = hack;
            });

            state.collection = newCollection;
            state.collectionLoaded = true;
            state.collectionLoading = false;
        },
        addHackToCollection: (state, action: PayloadAction<CollectedHack>) => {
            const newCollection = { ...state.collection };
            newCollection[action.payload.id] = action.payload;

            state.collection = newCollection;
            state.collectionLoading = false;
        },
        markGalleryLoading: (state) => {
            state.galleryLoading = true;
            state.galleryStarted = true;
        },
        appendGalleryHacks: (state, action: PayloadAction<Hack[]>) => {
            state.gallery = state.gallery.concat(action.payload);
            state.galleryLoading = false;
        },
        populateHackDetail: (state, action: PayloadAction<IdHackDetails>) => {
            const newCollection: Record<number, IdHackDetails> = { ...state.galleryDetails };
            newCollection[action.payload.id] = action.payload;
            state.galleryDetails = newCollection;
            state.galleryLoading = false;
        },
    }
});

export const { populateCollection, addHackToCollection, appendGalleryHacks, populateHackDetail, markCollectionLoading, markGalleryLoading } = hackSlice.actions;
export default hackSlice.reducer;