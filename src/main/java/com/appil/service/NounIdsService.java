package com.appil.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class NounIdsService {
	
	private List<Long> nounIds;

    // Constructor to initialize the nounIds list
    public NounIdsService() {
        this.nounIds = new ArrayList<>();
    }

    // Method to add a noun ID to the list
    public void addNounId(Long id) {
        nounIds.add(id);
    }

    // Method to get the list of noun IDs
    public List<Long> getNounIds() {
        return nounIds;
    }

    // Method to clear the nounIds list
    public void clearNounIds() {
        nounIds.clear();
    }

}
