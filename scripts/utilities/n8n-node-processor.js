/**
 * n8n Node Processor for Dubai B2B Intelligence Platform
 * Transforms webhook payload into structured lead data for CRM integration
 */

// For processing Dubai B2B Intelligence webhook data
const items = $input.all();
const updatedItems = [];

items.forEach((item) => {
  const data = item.json;
  
  // Process intelligence summary first
  if (data.intelligence) {
    // Add intelligence summary as first item
    updatedItems.push({
      type: 'intelligence_summary',
      timestamp: data.timestamp,
      source: data.source,
      searchQuery: data.searchMetadata?.query || 'Unknown',
      location: data.searchMetadata?.location || 'Unknown',
      totalLeads: data.intelligence.summary?.totalLeads || 0,
      highPriorityLeads: data.intelligence.summary?.highPriority || 0,
      avgLeadScore: data.intelligence.summary?.avgLeadScore || 0,
      dataCompleteness: data.intelligence.summary?.dataCompleteness || 0,
      marketOpportunity: data.intelligence.marketOpportunity?.totalOpportunityScore || 0
    });
  }
  
  // Process each lead
  if (data.leads && Array.isArray(data.leads)) {
    data.leads.forEach((lead, index) => {
      const leadItem = {
        type: 'lead',
        leadNumber: index + 1,
        
        // Business Information
        businessName: lead.businessInfo?.name || 'Unknown Business',
        category: lead.businessInfo?.category || 'Unknown Category',
        address: {
          full: lead.businessInfo?.address || '',
          area: lead.businessInfo?.area || '',
          emirate: lead.businessInfo?.emirate || '',
          coordinates: {
            lat: lead.businessInfo?.coordinates?.lat || null,
            lng: lead.businessInfo?.coordinates?.lng || null
          }
        },
        
        // Contact Information
        contact: {
          phone: lead.contact?.phone || '',
          email: lead.contact?.email || '',
          website: lead.contact?.website || ''
        },
        
        // Lead Scoring & Priority
        leadScore: lead.leadScoring?.totalScore || 0,
        priority: lead.leadScoring?.priority || 'Unknown',
        recommendations: lead.leadScoring?.recommendations || [],
        reasoning: lead.leadScoring?.reasoning || [],
        
        // Business Intelligence
        businessSize: lead.aiClassification?.businessSize || 'Unknown',
        industryCategory: lead.aiClassification?.industryCategory || 'Unknown',
        targetMarket: lead.aiClassification?.targetMarket || 'Unknown',
        companyStage: lead.aiClassification?.companyStage || 'Unknown',
        keyInsights: lead.aiClassification?.keyInsights || '',
        
        // Technology Analysis
        digitalMaturity: lead.technologyAnalysis?.digitalMaturity || 'Unknown',
        securityLevel: lead.technologyAnalysis?.securityLevel || 'Unknown',
        technologies: lead.technologyAnalysis?.technologies?.detected || {},
        
        // Quality Metrics
        rating: lead.metrics?.rating || 0,
        reviewCount: lead.metrics?.reviewCount || 0,
        dataQualityScore: lead.metrics?.dataQualityScore || 0,
        verificationStatus: lead.metrics?.verificationStatus || 'Unknown',
        
        // Data Source
        dataSource: lead.dataSource?.primary || 'Unknown',
        confidence: lead.dataSource?.confidence || 0,
        
        // CRM Ready Fields
        crmStatus: 'new',
        assignedTo: '', // To be filled by workflow
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        tags: [
          lead.leadScoring?.priority?.toLowerCase() || 'standard',
          lead.aiClassification?.industryCategory?.toLowerCase() || 'general',
          lead.technologyAnalysis?.securityLevel?.toLowerCase() || 'unknown'
        ],
        
        // Action Items based on lead score
        actionItems: generateActionItems(lead),
        
        // Processing metadata
        processedAt: new Date().toISOString(),
        batchId: data.timestamp,
        sourceWorkflow: 'dubai-b2b-intelligence'
      };
      
      updatedItems.push(leadItem);
    });
  }
});

// Helper function to generate action items based on lead data
function generateActionItems(lead) {
  const actions = [];
  const score = lead.leadScoring?.totalScore || 0;
  const priority = lead.leadScoring?.priority || 'Unknown';
  const securityLevel = lead.technologyAnalysis?.securityLevel || 'Unknown';
  
  // High priority actions
  if (score >= 70) {
    actions.push({
      type: 'immediate_contact',
      description: 'Schedule immediate consultation call',
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day
    });
  }
  
  // Security-based actions
  if (securityLevel === 'Low' || securityLevel === 'Basic') {
    actions.push({
      type: 'security_assessment',
      description: 'Propose cybersecurity audit',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
    });
  }
  
  // Technology modernization actions
  if (lead.technologyAnalysis?.digitalMaturity === 'Basic' || lead.technologyAnalysis?.digitalMaturity === 'Developing') {
    actions.push({
      type: 'tech_modernization',
      description: 'Present technology upgrade solutions',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
  }
  
  // Default follow-up
  if (actions.length === 0) {
    actions.push({
      type: 'standard_followup',
      description: 'Send introductory email and services overview',
      priority: 'medium',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days
    });
  }
  
  return actions;
}

return updatedItems;