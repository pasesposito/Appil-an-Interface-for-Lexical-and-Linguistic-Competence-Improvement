package com.appil.service;

import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.appil.entity.Processed;
import com.appil.repository.ProcessedRepository;

@Service
public class ProcessedService {

	@Autowired
	private ProcessedRepository processedRepository;

	@Async
	public CompletableFuture<Void> saveProcessed(long userId, String title, String text, String relations,
			String wikiPage, String modified) {
		return CompletableFuture.runAsync(() -> {
			if (!processedRepository.existsByUserIdAndText(userId, text.trim())) {

				Processed processed = new Processed();
				processed.setUserId(userId);
				processed.setTitle(title);
				processed.setText(text);
				processed.setRelationGraph(relations);
				processed.setWikiPage("false".equals(modified) ? null : wikiPage);
				processed.setModified("trueFromWiki".equals(modified) ? "yes" : "no");
				processedRepository.save(processed);
			}

		});
	}
}
