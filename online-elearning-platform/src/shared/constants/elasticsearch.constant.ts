export const ES_INDEX = {
  COURSES: process.env.ELASTICSEARCH_INDEX_COURSES || 'elearning_courses',
} as const

export const ES_MAPPINGS = {
  COURSES: {
    properties: {
      id: { type: 'keyword' },
      title: { 
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' }  
        }
      },
      description: { type: 'text' },
      smallDescription: { type: 'text' },
      slug: { type: 'keyword' },
      category: { type: 'keyword' },
      level: { type: 'keyword' },
      status: { type: 'keyword' },
      thumbnail: { type: 'keyword', index: false },
      duration: { type: 'integer' },
      instructor: {
        properties: {
          id: { type: 'keyword' },
          fullName: { type: 'text' },
          email: { type: 'keyword' },
          avatar: { type: 'keyword', index: false },
        }
      },
      enrollmentCount: { type: 'integer' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    }
  }
} as const