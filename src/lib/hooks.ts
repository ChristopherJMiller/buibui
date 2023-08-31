import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "."
import { CollectedHack, Hack, HackDetails, addHackToCollection, appendGalleryHacks, markCollectionLoading, markGalleryLoading, populateCollection, populateHackDetail } from "./hack";
import { invoke } from "@tauri-apps/api";
import { useEffect, useMemo } from "react";
import { ModalState } from "./modal";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const collectHack = async (dispatch: AppDispatch, base: Hack, details: HackDetails) => {
    try {
        dispatch(markCollectionLoading());
        const collectedHack: CollectedHack = await invoke('add_hack', { base, details });
        dispatch(addHackToCollection(collectedHack));
    } catch (e) {
        console.error(e);
    }
};

const callPopulateCollection = async (dispatch: AppDispatch) => {
    try {
        dispatch(markCollectionLoading());
        const collection: CollectedHack[] = await invoke('hack_collection');
        console.log(collection);
        dispatch(populateCollection(collection));
    } catch (e) {
        console.error(e);
    }
};

export const useCollection = () => {
    const dispatch = useAppDispatch();
    const { collection, collectionLoaded, collectionLoading } = useAppSelector((state) => state.hacks);

    useEffect(() => {
        if (!collectionLoaded && collection && !collectionLoading) {
            callPopulateCollection(dispatch);
        }
    }, [collectionLoaded, collection, collectionLoading]);

    return collectionLoaded ? collection : [];
};

const fetchGalleryData = async (dispatch: AppDispatch, chunkIndex: number) => {
    try {
        dispatch(markGalleryLoading());
        const newData: Hack[] = await invoke('get_hack_list', {
            page: Math.floor((chunkIndex * 5) / 10),
        });
            
       dispatch(appendGalleryHacks(newData));   
    } catch (e) {
        console.error(e);
    }
};

interface GalleryContext {
    loading: boolean,
    hacks: Hack[],
    fetchData: (chunkIndex: number) => Promise<void>,
}

export const useGallery = (): GalleryContext => {
    const dispatch = useAppDispatch();
    const { gallery, galleryLoading, galleryStarted } = useAppSelector((state) => state.hacks);
    const fetchData = (chunkIndex: number) => fetchGalleryData(dispatch, chunkIndex);

    useEffect(() => {
        if (!galleryStarted && !galleryLoading && gallery.length === 0) {
            fetchGalleryData(dispatch, 0);
        }
    }, [galleryStarted, galleryLoading, gallery]);

    return { loading: galleryLoading, hacks: gallery, fetchData };
};

export const fetchSelectedHackDetails = async (dispatch: AppDispatch, selectedHack: Hack) => {
    try {
        dispatch(markGalleryLoading());
        const details: HackDetails = await invoke('get_hack_details', {
            id: selectedHack.id,
        });
        
        dispatch(populateHackDetail({
            ...details,
            id: selectedHack.id
        }));
    } catch (e) {
        console.error(e);
    }
}

interface ModalContext extends ModalState {
    details?: HackDetails,
    galleryLoading: boolean,
    collectHack: (dispatch: AppDispatch, base: Hack, details: HackDetails) => Promise<void>,
    inCollection: boolean,
}

export const useModal = (): ModalContext => {
    const dispatch = useAppDispatch();
    const state = useAppSelector((state) => state.modal);
    const { galleryDetails, galleryLoading } = useAppSelector((state) => state.hacks);
    const collection = useCollection();

    const inCollection = useMemo(() => {
        if (state.selectedHack) {
            return collection[state.selectedHack.id] !== undefined;
        } else {
            return false;
        }
    }, [collection, state.selectedHack]);

    console.log(inCollection);

    const details = useMemo(() => {
        return state.selectedHack ? galleryDetails[state.selectedHack.id] : undefined;
    }, [state.selectedHack, galleryDetails]);

    useEffect(() => {
        if (state.selectedHack) {
            if (details === undefined && !galleryLoading) {
                fetchSelectedHackDetails(dispatch, state.selectedHack);
            }
        }
    }, [state.selectedHack, details, galleryLoading, dispatch]);

    return {
        ...state,
        details,
        galleryLoading,
        collectHack,
        inCollection,
    };
}