package com.stjoseph.assessmentsystem.dto;

public class AlumniStatsResponse {
    private long networkConnections;
    private long eventsCount;
    private long jobsPosted;
    
    public AlumniStatsResponse() {}
    
    public AlumniStatsResponse(long networkConnections, long eventsCount, long jobsPosted) {
        this.networkConnections = networkConnections;
        this.eventsCount = eventsCount;
        this.jobsPosted = jobsPosted;
    }
    
    // Getters and setters
    public long getNetworkConnections() {
        return networkConnections;
    }
    
    public void setNetworkConnections(long networkConnections) {
        this.networkConnections = networkConnections;
    }
    
    public long getEventsCount() {
        return eventsCount;
    }
    
    public void setEventsCount(long eventsCount) {
        this.eventsCount = eventsCount;
    }
    
    public long getJobsPosted() {
        return jobsPosted;
    }
    
    public void setJobsPosted(long jobsPosted) {
        this.jobsPosted = jobsPosted;
    }
}
