import logger from "./logger";
import {
  LinkType,
  type Post,
  type Profile,
  type Project,
  type Resume,
} from "./types";

class APIClient {
  private baseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private cacheExpiry: number; // in milliseconds

  constructor(baseUrl: string, cacheExpiry = 24 * 60 * 60 * 1000) {
    // 24 hours default
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.cacheExpiry = cacheExpiry;
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cached = this.cache.get(endpoint);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheExpiry) {
      return cached.data as T;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(endpoint, { data, timestamp: now });
    return data as T;
  }

  async getProfile(): Promise<Profile> {
    // this.fetchWithCache<Profile>('/api/profile');
    return {
      name: "tony kabilan okeke",
      username: "kabilan108",
      title: "machine learning engineer",
      bio: `Passionate about leveraging AI and software engineering to solve
      complex problems. Expertise in machine learning algorithms and
      full-stack development. Creating innovative solutions that make a
      difference.`,
      imageUrl: "https://images.kabilan108.com/profile.jpeg",
      location: "Philadelphia, PA",
      links: {
        [LinkType.EMAIL]: "tonykabilanokeke@gmail.com",
        [LinkType.GITHUB]: "https://github.com/kabilan108",
        [LinkType.X]: "https://x.com/kabilan108",
        [LinkType.LINKEDIN]: "https://www.linkedin.com/in/kabilan108",
        [LinkType.MAL]: "https://myanimelist.net/animelist/Kabilan108",
      },
    };
  }

  async getPosts(): Promise<Post[]> {
    // return this.fetchWithCache<Post[]>('/api/posts/latest');
    return [
      {
        id: 1,
        title: "Building Scalable ML Pipelines",
        excerpt:
          "A comprehensive guide to building production-ready machine learning pipelines using modern tools and best practices.",
        slug: "building-scalable-ml-pipelines",
        tags: ["Machine Learning", "MLOps", "Python", "Docker"],
        createdOn: new Date("2024-01-15"),
        featured: true,
      },
      {
        id: 2,
        title: "Deep Learning for Computer Vision",
        excerpt:
          "Exploring state-of-the-art deep learning architectures for computer vision tasks, from classification to object detection.",
        slug: "deep-learning-computer-vision",
        tags: ["Deep Learning", "Computer Vision", "PyTorch", "CNN"],
        createdOn: new Date("2024-01-10"),
        featured: false,
      },
      {
        id: 3,
        title: "Optimizing Neural Networks",
        excerpt:
          "Advanced techniques for improving neural network performance, including hyperparameter tuning and architecture search.",
        slug: "optimizing-neural-networks",
        tags: ["Neural Networks", "Optimization", "TensorFlow", "Performance"],
        createdOn: new Date("2024-01-05"),
        featured: true,
      },
    ];
  }

  async getPost(slug: string): Promise<Post> {
    // const posts = await this.getPosts();
    // return posts.find((post) => post.slug === slug) || null;
    logger.info(`fetching post with slug: ${slug}`);
    throw new Error("Not implemented");
  }

  async getProjects(): Promise<Project[]> {
    // return this.fetchWithCache<Project[]>('/api/projects/featured');
    return [
      {
        id: 1,
        title: "Predictive_Maintenance_ML",
        description:
          "Machine learning model to predict equipment failures, reducing downtime by 30%.",
        tags: ["Python", "TensorFlow", "Scikit-learn"],
        github: "https://github.com/johndoe/predictive-maintenance",
        demo: "https://demo.predictive-maintenance.com",
        featured: true,
        createdOn: new Date("2024-01-15"),
      },
      {
        id: 2,
        title: "Realtime_Data_Pipeline",
        description:
          "Scalable data pipeline using Apache Kafka and Spark for processing millions of events per second.",
        tags: ["Scala", "Apache Kafka", "Apache Spark"],
        github: "https://github.com/johndoe/realtime-pipeline",
        featured: false,
        createdOn: new Date("2024-01-10"),
      },
      {
        id: 3,
        title: "NLP_Chatbot",
        description:
          "AI-powered chatbot capable of understanding and responding to complex queries in multiple languages.",
        tags: ["Python", "NLTK", "Transformer Models"],
        github: "https://github.com/johndoe/nlp-chatbot",
        demo: "https://chatbot-demo.johndoe.com",
        featured: true,
        createdOn: new Date("2024-01-05"),
      },
    ];
  }

  async getResume(): Promise<Resume> {
    // return this.fetchWithCache<Resume>('/api/resume');
    // TODO: featured projects should be included in the resume
    return {
      education: [
        {
          id: 2,
          degree: "M.S. in Biomedical Engineering",
          institution: "Drexel University",
          duration: "2022 - 2024",
          details: "Concentration in Bioinformatics",
          location: "Philadelphia, PA",
        },
        {
          id: 1,
          degree: "B.S. in Biomedical Engineering",
          institution: "Drexel University",
          duration: "2019 - 2024",
          details: "Concentration in Neuroengineering",
          location: "Philadelphia, PA",
        },
      ],
      workExperience: [
        {
          id: 1,
          position: "Machine Learning Engineer",
          company: "Moberg Analytics",
          startDate: new Date("2024-08-01"),
          endDate: null,
          location: "Philadelphia, PA",
          responsibilities: [
            "Developing models for artifact detection in arterial blood pressure waveforms. lorem lipsum dolor sit amet, consectetur adipiscing elit.",
            "Developing models for artifact detection in arterial blood pressure waveforms. lorem lipsum dolor sit amet, consectetur adipiscing elit.",
          ],
        },
      ],
      skills: {
        "programming languages": ["Python", "R", "SQL"],
        frameworks: ["PyTorch", "TensorFlow", "Scikit-learn"],
      },
      publications: [
        {
          id: 1,
          title: "Artifact Detection in Arterial Blood Pressure Waveforms",
          journal: "Journal of Biomedical Engineering",
          authors: ["Tony Kabilan Okeke", "John Doe"],
          me: 1,
          publishedOn: new Date("2024-01-15"),
          isPublished: false,
          citation:
            "Niroshana, S. I., Kuroda, S., Tanaka, K., & Chen, W. (2023). Beat-wise segmentation of electrocardiogram using adaptive windowing and deep neural network. Scientific Reports, 13(1), 11039.",
          url: "",
          pdfPath: "/pdf/publication/artifact-detection.pdf",
        },
        {
          id: 2,
          title:
            "Persistent Depletion of Neuroprotective Factors Accompanies Neuroinflammatory, Neurodegenerative, and Vascular Remodeling Spectra in Serum Three Months after Non-Emergent Cardiac Surger",
          journal: "Journal of Biomedical Engineering",
          authors: [
            "Laudanski, K.",
            "Liu, D.",
            "Okeke, T.",
            "Restrepo, M.",
            "Szeto, W.Y.",
          ],
          me: 3,
          publishedOn: new Date("2022-01-15"),
          isPublished: true,
          citation:
            "Niroshana, S. I., Kuroda, S., Tanaka, K., & Chen, W. (2023). Beat-wise segmentation of electrocardiogram using adaptive windowing and deep neural network. Scientific Reports, 13(1), 11039.",
          url: "https://doi.org/10.1038/s41598-023-37773-y",
          pdfPath: "/pdf/publication/artifact-detection.pdf",
        },
      ],
      abstracts: [
        {
          id: 1,
          title: "Artifact Detection in Arterial Blood Pressure Waveforms",
          journal: "Journal of Biomedical Engineering",
          authors: ["Tony Kabilan Okeke", "John Doe"],
          me: 1,
          publishedOn: new Date("2024-01-15"),
          isPublished: true,
          citation: "",
          url: "",
          pdfPath: "/pdf/abstract/artifact-detection.pdf",
        },
      ],
      awards: [
        {
          id: 1,
          title: "Drexel University Dean's List",
          startDate: new Date("2022-05-01"),
          endDate: new Date("2024-05-01"),
        },
        {
          id: 2,
          title: "Drexel Startups Fund",
          amount: 1000,
          startDate: new Date("2022-05-01"),
          endDate: null,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
      ],
      organizations: [
        {
          id: 1,
          name: "IEEE",
          position: "Member",
          duration: "2022 - Present",
        },
        {
          id: 2,
          name: "Tau Beta Pi",
          position: "Member",
          duration: "2022 - Present",
        },
      ],
    };
  }
}

export const apiClient = new APIClient(import.meta.env.VITE_API_BASE_URL);
