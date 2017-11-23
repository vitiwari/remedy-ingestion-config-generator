package com.bmc.truesight.saas.remedyconfiggenerator;

import java.util.HashMap;
import java.util.Map;

public class TSIEvent {

    private Map<String, String> properties;

    public TSIEvent(TSIEvent payload) {
        this.setProperties(new HashMap<String, String>(payload.getProperties()));
    }

    public TSIEvent() {
        // Default Constructor
    }

    public Map<String, String> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, String> properties) {
        this.properties = properties;
    }

}
