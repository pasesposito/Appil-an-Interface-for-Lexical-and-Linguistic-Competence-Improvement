package com.appil.service;


import java.util.List;

import org.springframework.stereotype.Service;

import com.appil.dto.WordDTO;

@Service
public class HtmlGenerationService {

    public String generateHtml(List<WordDTO> words) {
        StringBuilder html = new StringBuilder();
        int id = 0;

        for (int i = 0; i < words.size(); i++) {
            WordDTO w = words.get(i);

            String link = "";
            String additionalAttributes = "";
            String cssClass = "enhanceble";
            boolean hasHref = false;

            if (w.isEntity()) {
                link = w.getLink();
                additionalAttributes = "title=\"\" value=\"" + w.getTag() + "\"";
                cssClass = "entity";
                hasHref = false;
                // Add data-entity-type attribute for entities
                if (w.getEntityType() != null) {
                    additionalAttributes += " data-entity-type=\"" + w.getEntityType().name() + "\"";
                }
                
            } else if (w.getWikiPage() != null && !w.getWikiPage().equals("Sorry, no enhancement")) {
                link = w.getWikiPage();
                cssClass = "enhanced";
                hasHref = true;
            }

            if (hasHref) {
                html.append("<a id=\"").append(id).append("\" class=\"").append(cssClass).append("\" href=\"").append(link).append("\" ").append(additionalAttributes).append(" target=\"_blank\">").append(w.getForm()).append("</a>");
            } else if (w.isPunctuation()) {
                html.append(w.getForm());
            } else {
                html.append("<a id=\"").append(id).append("\" class=\"").append(cssClass).append("\" ").append(additionalAttributes).append(">").append(w.getForm()).append("</a>");
            }

            if (i < words.size() - 1 && !words.get(i + 1).isPunctuation()) {
                html.append(" ");
            }

            id++;
        }

        return html.toString();
    }
}

//import org.springframework.stereotype.Service;
//
//import java.util.List;

//@Service
//public class HtmlGenerationService {
//
//    public String generateHtml(List<WordDTO> words) {
//        StringBuilder html = new StringBuilder();
//        int id = 0;
//
//        for (int i = 0; i < words.size(); i++) {
//            WordDTO w = words.get(i);
//
//            String link = "";
//            String additionalAttributes = "";
//            String cssClass = "enhanceble";
//            boolean hasHref = false;
//
//            if (w.isEntity()) {
//                link = w.getLink();
//                additionalAttributes = "title=\"\" value=\"" + w.getTag() + "\"";
//                cssClass = "entity";
//                hasHref = true;
//            } else if (w.getWikiPage() != null && w.getWikiPage() != "Sorry, no enhancement") {
//                link = w.getWikiPage();
//                cssClass = "enhanced";
//                hasHref = true;
//            }
//
//            if (hasHref) {
//                html.append("<a id=\"").append(id).append("\" class=\"").append(cssClass).append("\" href=\"").append(link).append("\" ").append(additionalAttributes).append(" target=\"_blank\">").append(w.getForm()).append("</a>");
//            } else if (w.isPunctuation()) {
//                html.append(w.getForm());
//            } else {
//                html.append("<a id=\"").append(id).append("\" class=\"").append(cssClass).append("\" ").append(additionalAttributes).append(">").append(w.getForm()).append("</a>");
//            }
//
//            if (i < words.size() - 1 && !words.get(i + 1).isPunctuation()) {
//                html.append(" ");
//            }
//
//            id++;
//        }
//
//        return html.toString();
//    }
//}
