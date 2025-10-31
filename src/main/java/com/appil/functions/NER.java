package com.appil.functions;

import edu.stanford.nlp.simple.*;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;




public interface NER {
	
	
	public static void main (String [] args) {
		
		System.out.println(NER.entityRec("INDIANAPOLIS -- Midway through the second quarter of Sunday's NBA All-Star Game inside Gainbridge Fieldhouse, LeBron James secured an outlet pass with his left hand and, in one smooth motion, looped a pass over the head of Damian Lillard and into the hands of Western Conference teammate Paul George.\r\n"
				+ "\r\n"
				+ ""));
		
	}
   
	public static Map<String, List<String>> entityRec(String text) {
       
		Document document = new Document(text);

        // Creare una HashMap per associare la tipologia di entità a una lista di parole
        Map<String, List<String>> entitaMap = new HashMap<>();

        for (Sentence sentence : document.sentences()) {
            List<String> parole = sentence.words();
            List<String> nerTags = sentence.nerTags();

            for (int i = 0; i < parole.size(); i++) {
                String parola = parole.get(i);
                String nerTag = nerTags.get(i);

                // Aggiungi la parola alla lista associata al tipo di tag
                entitaMap.computeIfAbsent(nerTag, k -> new ArrayList<>()).add(parola);
            }
        }
        
		return entitaMap;

    }
}
