// Simplified n8n Code Node for Dubai B2B Intelligence Platform
// Copy this code into your n8n "Code" node

const items = $input.all();
const updatedItems = [];

items.forEach((item) => {
  const data = item.json;
  
  // Process each lead from the intelligence data
  if (data.leads && Array.isArray(data.leads)) {
    data.leads.forEach((lead, index) => {
      updatedItems.push({
        // Basic Lead Info
        leadId: `${data.timestamp}-${index + 1}`,
        businessName: lead.businessInfo?.name || 'Unknown Business',
        category: lead.businessInfo?.category || '',
        
        // Contact Details
        phone: lead.contact?.phone || '',
        email: lead.contact?.email || '',
        website: lead.contact?.website || '',
        
        // Address
        address: lead.businessInfo?.address || '',
        area: lead.businessInfo?.area || '',
        emirate: lead.businessInfo?.emirate || '',
        
        // Lead Scoring
        leadScore: lead.leadScoring?.totalScore || 0,
        priority: lead.leadScoring?.priority || 'Medium',
        
        // Business Intelligence
        businessSize: lead.aiClassification?.businessSize || '',
        industry: lead.aiClassification?.industryCategory || '',
        companyStage: lead.aiClassification?.companyStage || '',
        
        // Technology Assessment
        digitalMaturity: lead.technologyAnalysis?.digitalMaturity || '',
        securityLevel: lead.technologyAnalysis?.securityLevel || '',
        
        // Quality Metrics
        rating: lead.metrics?.rating || 0,
        reviewCount: lead.metrics?.reviewCount || 0,
        dataQuality: lead.metrics?.dataQualityScore || 0,
        
        // CRM Fields
        status: 'new',
        source: 'Dubai-B2B-Intelligence',
        tags: [
          lead.leadScoring?.priority?.toLowerCase() || 'standard',
          lead.aiClassification?.industryCategory?.toLowerCase() || 'general'
        ].join(','),
        
        // Action Required
        nextAction: getNextAction(lead.leadScoring?.totalScore || 0, lead.technologyAnalysis?.securityLevel),
        
        // Metadata
        processedAt: new Date().toISOString(),
        searchQuery: data.searchMetadata?.query || '',
        batchId: data.timestamp
      });
    });
  }
});

// Helper function to determine next action
function getNextAction(score, securityLevel) {
  if (score >= 70) return 'Immediate consultation call';
  if (securityLevel === 'Low') return 'Cybersecurity assessment';
  if (score >= 50) return 'Schedule demo call';
  return 'Send welcome email';
}

return updatedItems;