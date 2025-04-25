import { useState } from "react";
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

export function TagSelectModal({ info, setInfo, onApply }) {
    const [ keyword, setKeyword ] = useState('');

    const resetInfo = () => setInfo((inf) => ({
        ...inf,
        productId: null,
        allTags: Array.from(new Set([ ...inf.allTags, ...inf.addedTags ]))
    }));
    const selectTag = (tags) => setInfo((inf) => ({
        ...inf,
        selectedTags: Array.from(new Set([ ...inf.selectedTags, tags[0] ]))
    }));
    const unselectTag = (tags) => setInfo((inf) => ({ ...inf, selectedTags: tags }));
    const addTag = () => setInfo((inf) => ({
        ...inf,
        addedTags: Array.from(new Set([ ...inf.addedTags, ...keyword.split(',') ]))
    }));
    const removeAddedTag = (tags) => setInfo((inf) => ({ ...inf, addedTags: tags }));

    function getUnselectedTags() {
        return info.allTags.filter(item => !info.selectedTags.includes(item));
    }

    function filterTagsByKeyword(array, equal = false) {
        if (equal) return array.filter(str => str === keyword);
        return array.filter(str => str.toLowerCase().includes(keyword));
    }

    function handleAddKeyword() {
        addTag();
        setKeyword('');
    }

    function closeModal() {
        resetInfo();
        setKeyword('');
    }

    return (
        <Modal
            variant="base"
            open={!!info.productId}
            onHide={closeModal}
        >
            <TitleBar title={`${info.productName || ''}'s Tags`}>
                <button variant="primary" onClick={() => {
                    onApply(info.productId, [ ...info.selectedTags, ...info.addedTags ]);
                    closeModal();
                }}>Save
                </button>
                <button onClick={closeModal}>Cancel</button>
            </TitleBar>
            <Box padding="400" paddingBlockEnd="200">
                <Box paddingBlockEnd="200">
                    <Combobox
                        activator={
                            <Combobox.TextField
                                prefix={<Icon source={SearchIcon}/>}
                                onChange={(v) => setKeyword(v)}
                                label="Search tags"
                                labelHidden
                                value={keyword}
                                placeholder="Search to find or create tags"
                                autoComplete="off"
                            />
                        }
                    />
                </Box>
                {keyword !== '' && filterTagsByKeyword([ ...info.allTags, ...info.addedTags ], true).length < 1 && (
                    <Button icon={PlusCircleIcon} variant="tertiary" textAlign="start" fullWidth
                            onClick={handleAddKeyword}>
                        Add "{keyword}"
                    </Button>
                )}
                {info.addedTags.length < 1 && filterTagsByKeyword(info.allTags).length < 1 ? (
                    <Box paddingBlock="400" minHeight="368px">
                        <Text as="p" alignment="center" tone="subdued">Tag not found</Text>
                    </Box>
                ) : (
                    <Scrollable style={{ height: '400px' }} scrollbarGutter="stable" scrollbarWidth="thin">
                        <Box paddingBlock="200">
                            <BlockStack gap="400">
                                <div className={`custom-choice-list ${info.addedTags.length < 1 ? 'hidden' : ''}`}>
                                    <ChoiceList
                                        allowMultiple
                                        title={<Box paddingBlockEnd="200">
                                            <Text as="h6" fontWeight="semibold">Newly Added</Text>
                                        </Box>}
                                        choices={info.addedTags.map(tag => ({
                                            label: tag,
                                            value: tag
                                        }))}
                                        selected={info.addedTags}
                                        onChange={(tags) => removeAddedTag(tags)}
                                    />
                                </div>
                                <div
                                    className={`custom-choice-list ${filterTagsByKeyword(info.selectedTags).length < 1 ? 'hidden' : ''}`}>
                                    <ChoiceList
                                        allowMultiple
                                        title={<Box paddingBlockEnd="200">
                                            <Text as="h6" fontWeight="semibold">Add</Text>
                                        </Box>}
                                        choices={filterTagsByKeyword(info.selectedTags).map(tag => ({
                                            label: tag,
                                            value: tag
                                        }))}
                                        selected={info.selectedTags}
                                        onChange={(tags) => unselectTag(tags)}
                                    />
                                </div>
                                <div
                                    className={`custom-choice-list ${filterTagsByKeyword(getUnselectedTags()).length < 1 ? 'hidden' : ''}`}>
                                    <ChoiceList
                                        allowMultiple
                                        title={<Box paddingBlockEnd="200">
                                            <Text as="h6" fontWeight="semibold">Available</Text>
                                        </Box>}
                                        choices={filterTagsByKeyword(getUnselectedTags()).map(tag => ({
                                            label: tag,
                                            value: tag
                                        }))}
                                        selected={[]}
                                        onChange={(tags) => selectTag(tags)}
                                    />
                                </div>
                            </BlockStack>
                        </Box>
                    </Scrollable>
                )}
            </Box>
        </Modal>
    );
}
