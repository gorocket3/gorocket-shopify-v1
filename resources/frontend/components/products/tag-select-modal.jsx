import { useState, useTransition } from "react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
    Box,
    Text,
    BlockStack,
    Button,
    Combobox,
    Icon,
    ChoiceList,
    Scrollable
} from "@shopify/polaris";
import { PlusCircleIcon, SearchIcon } from "@shopify/polaris-icons";
import { sortIgnoreCase } from "../../utils/formats";
import { useEffectWithoutInitialState } from "../../utils/hooks";

export function TagSelectModal({ tagInfo, resetTagInfo, allTags, onApply }) {
    const [ keyword, setKeyword ] = useState('');
    const [ fullTags, setFullTags ] = useState([]);
    const [ selectedTags, setSelectedTags ] = useState([]);
    const [ unselectedTags, setUnselectedTags ] = useState([]);
    const [ addedTags, setAddedTags ] = useState([]);
    const [ visibleCount, setVisibleCount ] = useState(50);
    const [ isPending, startTransition ] = useTransition();

    function getArrayIntersection(prevArray, newItems) {
        const arraySet = new Set(prevArray);

        return newItems.filter(item => arraySet.has(item));
    }

    function getArrayWithoutDuplicates(prevArray, newItems) {
        const arraySet = new Set(prevArray);

        if (Array.isArray(newItems)) {
            newItems.forEach(item => {
                if (!arraySet.has(item)) arraySet.add(item);
            });
        } else {
            if (!arraySet.has(newItems)) arraySet.add(newItems);
        }

        return Array.from(arraySet);
    }

    function getArrayDifference(prevArray, newItems) {
        const arraySet = new Set(newItems);
        const result = [];

        for (let i = 0; i < prevArray.length; i++) {
            if (!arraySet.has(prevArray[i])) {
                result.push(prevArray[i]);
            }
        }

        return result;
    }

    const selectOneTag = (newTags) => {
        startTransition(() => {
            setSelectedTags((prevTags) => getArrayWithoutDuplicates(prevTags, newTags[0]));
        });
    }

    const unselectOneTag = (newTags) => {
        startTransition(() => {
            setSelectedTags((prevTags) => getArrayIntersection(prevTags, newTags));
        });
    }

    const addNewTag = () => {
        startTransition(() => {
            setAddedTags((prevTags) => getArrayWithoutDuplicates(keyword.split(','), prevTags));
            setKeyword('');
        });
    }

    const removeAddedTag = (newTags) => {
        startTransition(() => {
            setAddedTags((prevTags) => getArrayIntersection(prevTags, newTags));
        });
    }

    const closeModal = () => {
        resetTagInfo();
        setKeyword('');
    }

    const filterTagsByKeyword = (array, equal = false) => {
        if (keyword === '') return array;

        const lowerKeyword = keyword.toLowerCase();
        const result = [];

        for (let i = 0, len = array.length; i < len; i++) {
            const item = array[i];

            if (equal) {
                if (item == keyword) {
                    result.push(item);
                }
            } else {
                if (item.toLowerCase().includes(lowerKeyword)) {
                    result.push(item);
                }
            }
        }

        return result;
    }

    const saveTags = () => {
        startTransition(() => {
            const newTags = getArrayWithoutDuplicates(selectedTags, addedTags);
            onApply(tagInfo.productId, newTags);
            setFullTags((prevTags) => getArrayWithoutDuplicates(prevTags, addedTags));
            closeModal();
        });
    }

    useEffectWithoutInitialState(() => {
        setFullTags(allTags);
    }, [ allTags ]);

    useEffectWithoutInitialState(() => {
        setSelectedTags([ ...(tagInfo.selectedTags.filter(Boolean) || []) ]);
        setAddedTags([]);
    }, [ tagInfo.selectedTags ]);

    useEffectWithoutInitialState(() => {
        startTransition(() => {
            const difference = getArrayDifference(fullTags, selectedTags);
            setUnselectedTags(difference);
        });
    }, [ selectedTags ]);

    return (
        <Modal
            variant="base"
            open={!!tagInfo.productId}
            onHide={closeModal}
        >
            <TitleBar title={`${tagInfo.productName || ''}'s Tags`}>
                <button variant="primary" onClick={saveTags}>Save</button>
                <button onClick={closeModal}>Cancel</button>
            </TitleBar>
            <Box padding="400" paddingBlockEnd="200">
                <Box paddingBlockEnd="200">
                    <Combobox
                        activator={
                            <Combobox.TextField
                                prefix={<Icon source={SearchIcon}/>}
                                onChange={setKeyword}
                                label="Search tags"
                                labelHidden
                                value={keyword}
                                placeholder="Search to find or create tags"
                                autoComplete="off"
                            />
                        }
                    />
                </Box>
                {keyword !== '' && filterTagsByKeyword([ ...fullTags, ...addedTags ], true).length < 1 && (
                    <Button icon={PlusCircleIcon} variant="tertiary" textAlign="start" fullWidth
                            onClick={addNewTag}>
                        Add "{keyword}"
                    </Button>
                )}
                {addedTags.length < 1 && filterTagsByKeyword(fullTags).length < 1 ? (
                    <Box paddingBlock="400" minHeight="368px">
                        <Text as="p" alignment="center" tone="subdued">Tag not found</Text>
                    </Box>
                ) : (
                    <Scrollable style={{ height: '400px' }} scrollbarGutter="stable" scrollbarWidth="thin">
                        <Box paddingBlock="200">
                            <BlockStack gap="400">
                                <div className={`custom-choice-list ${addedTags.length < 1 ? 'hidden' : ''}`}>
                                    <ChoiceList
                                        allowMultiple
                                        title={<Box paddingBlockEnd="200">
                                            <Text as="h6" fontWeight="semibold">Newly Added</Text>
                                        </Box>}
                                        choices={addedTags.map(tag => ({
                                            label: tag,
                                            value: tag
                                        }))}
                                        selected={addedTags}
                                        onChange={removeAddedTag}
                                    />
                                </div>
                                <div
                                    className={`custom-choice-list ${filterTagsByKeyword(selectedTags).length < 1 ? 'hidden' : ''}`}>
                                    <ChoiceList
                                        allowMultiple
                                        title={<Box paddingBlockEnd="200">
                                            <Text as="h6" fontWeight="semibold">Add</Text>
                                        </Box>}
                                        choices={filterTagsByKeyword(selectedTags).map(tag => ({
                                            label: tag,
                                            value: tag
                                        }))}
                                        selected={selectedTags}
                                        onChange={unselectOneTag}
                                    />
                                </div>
                                <div
                                    className={`custom-choice-list ${filterTagsByKeyword(unselectedTags).length < 1 ? 'hidden' : ''}`}>
                                    <ChoiceList
                                        allowMultiple
                                        title={<Box paddingBlockEnd="200">
                                            <Text as="h6" fontWeight="semibold">Available</Text>
                                        </Box>}
                                        choices={filterTagsByKeyword(unselectedTags).slice(0, visibleCount).map(tag => ({
                                            label: tag,
                                            value: tag
                                        }))}
                                        selected={[]}
                                        onChange={selectOneTag}
                                    />
                                </div>
                                {visibleCount < filterTagsByKeyword(unselectedTags).length && (
                                    <Button variant="tertiary" textAlign="start" fullWidth
                                            onClick={() => setVisibleCount((count) => count + 50)}>
                                        <Text as="span" tone="subdued" fontWeight="semibold">Show more</Text>
                                    </Button>
                                )}
                            </BlockStack>
                        </Box>
                    </Scrollable>
                )}
            </Box>
        </Modal>
    );
}
