package com.appil.service;

import com.appil.dto.WordDTO;
import com.google.gson.Gson;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class CardDataService {

    public String generateCardData(List<WordDTO> words) {
        List<CardData> cardDataList = new ArrayList<>();
        List<String> imageInfoList = new ArrayList<>();

        for (WordDTO w : words) {
            if (w.getImageInfo() == null) {
                continue; // Skip if ImageInfo is null
            }

            String imageLink = w.getImageInfo().getLink();// Assuming getImageInfo() returns a JSON string or URL

            if (w.isToEnhance()) {
                if (imageLink != null || w.isEntity()) {
                    cardDataList.add(new CardData(w.getForm(), imageLink, w.getWikiPage()));
                    imageInfoList.add(imageLink); // Add the imageInfo to the list
                } else {
                    cardDataList.add(new CardData(w.getForm(), w.getForm(), w.getWikiPage()));
                }
            }
        }

        // Duplicate the list and shuffle it
        List<CardData> duplicatedList = new ArrayList<>(cardDataList);
        cardDataList.addAll(duplicatedList);
        Collections.shuffle(cardDataList);

        // Wrap the data into a wrapper object and convert to JSON
        CardAndImageInfoWrapper wrapper = new CardAndImageInfoWrapper(cardDataList, imageInfoList);
        Gson gson = new Gson();
        return gson.toJson(wrapper);
    }

    public static class CardAndImageInfoWrapper {
        private List<CardData> cards;
        private List<String> imageInfo;

        public CardAndImageInfoWrapper(List<CardData> cards, List<String> imageInfo) {
            this.cards = cards;
            this.imageInfo = imageInfo;
        }

        // Getters and setters
        public List<CardData> getCards() {
            return cards;
        }

        public void setCards(List<CardData> cards) {
            this.cards = cards;
        }

        public List<String> getImageInfo() {
            return imageInfo;
        }

        public void setImageInfo(List<String> imageInfo) {
            this.imageInfo = imageInfo;
        }
    }

    public static class CardData {
        private final String text;
        private final String image;
        private final String wikiPage;

        public CardData(String text, String image, String wikiPage) {
            this.text = text;
            this.image = image;
            this.wikiPage = wikiPage;
        }

        public String getText() {
            return text;
        }

        public String getImage() {
            return image;
        }

        public String getWikiPage() {
            return wikiPage;
        }
    }
}
