import CompanyOverview from '../models/CompanyOverview.js';
import { connectDB } from '../db/connect.js';

const DEFAULT_COMPANY_OVERVIEW = {
  companyInfo: {
    title: 'Who We Are',
    image: '/images/fibre1.jpeg',
    paragraphs: [
      {
        text: 'Modest Cargo is a dynamic, solutions-driven Engineering and Management Company committed to delivering world-class services across multiple sectors. Established in 2020 and legally incorporated in Nigeria in 2025 with a passion for innovation, engineering excellence, and sustainable project delivery.',
        order: 0,
      },
      {
        text: 'We bring together nearly two decades of multidisciplinary experience spanning construction, telecommunications, optical fibre implementation, operations and maintenance, project management, corporate governance, and corporate social responsibility.',
        order: 1,
      },
      {
        text: 'The Chairman/CEO is strongly supported by highly experienced professionals in engineering, accounting and finance, law, management, and more. Together, we deliver value, promote excellence, and exceed the expectations of our clients and customers.',
        order: 2,
      },
      {
        text: 'Our goal: to become a trusted African leader in engineering excellence, telecommunications infrastructure development, and strategic project delivery.',
        order: 3,
      },
    ],
  },
  vision: {
    title: 'Our Vision',
    description: 'To be a Globally Recognized Engineering and Management Brand known for Excellence, Innovation, and Reliable Project Delivery.',
  },
  mission: {
    title: 'Our Mission',
    description: 'To Provide Superior Engineering and Management Services Using Modern Technology, Professional Expertise, and a Commitment to Quality, Safety, and Customer Satisfaction.',
  },
  coreValues: [
    { name: 'Excellence', description: 'We deliver superior outcomes in every project.', color: 'indigo', order: 0 },
    { name: 'Integrity', description: 'Ethical, transparent, and trustworthy operations.', color: 'blue', order: 1 },
    { name: 'Innovation', description: 'Smart, modern, technology-driven solutions.', color: 'green', order: 2 },
    { name: 'Professionalism', description: 'High standards, certified competence, quality delivery.', color: 'yellow', order: 3 },
    { name: 'Customer-centric', description: 'Solutions tailored to each client\'s needs.', color: 'pink', order: 4 },
  ],
};

export async function getCompanyOverview() {
  try {
    await connectDB();

    let overviewData = await CompanyOverview.findOne();

    if (!overviewData) {
      overviewData = await CompanyOverview.create(DEFAULT_COMPANY_OVERVIEW);
    }

    return {
      success: true,
      data: overviewData,
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCompanyOverview(updateData) {
  try {
    await connectDB();

    let overviewData = await CompanyOverview.findOne();

    if (!overviewData) {
      overviewData = await CompanyOverview.create(DEFAULT_COMPANY_OVERVIEW);
    }

    // Update fields
    if (updateData.companyInfo) {
      overviewData.companyInfo = updateData.companyInfo;
    }
    if (updateData.vision) {
      overviewData.vision = updateData.vision;
    }
    if (updateData.mission) {
      overviewData.mission = updateData.mission;
    }
    if (updateData.coreValues) {
      overviewData.coreValues = updateData.coreValues;
    }

    overviewData.updatedAt = new Date();
    await overviewData.save();

    return {
      success: true,
      data: overviewData,
    };
  } catch (error) {
    console.error('Error updating company overview:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCompanyInfo(companyInfoData) {
  try {
    await connectDB();

    let overviewData = await CompanyOverview.findOne();
    if (!overviewData) {
      overviewData = await CompanyOverview.create(DEFAULT_COMPANY_OVERVIEW);
    }

    overviewData.companyInfo = companyInfoData;
    overviewData.updatedAt = new Date();
    await overviewData.save();

    return {
      success: true,
      data: overviewData,
    };
  } catch (error) {
    console.error('Error updating company info:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateVision(visionData) {
  try {
    await connectDB();

    let overviewData = await CompanyOverview.findOne();
    if (!overviewData) {
      overviewData = await CompanyOverview.create(DEFAULT_COMPANY_OVERVIEW);
    }

    overviewData.vision = visionData;
    overviewData.updatedAt = new Date();
    await overviewData.save();

    return {
      success: true,
      data: overviewData,
    };
  } catch (error) {
    console.error('Error updating vision:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateMission(missionData) {
  try {
    await connectDB();

    let overviewData = await CompanyOverview.findOne();
    if (!overviewData) {
      overviewData = await CompanyOverview.create(DEFAULT_COMPANY_OVERVIEW);
    }

    overviewData.mission = missionData;
    overviewData.updatedAt = new Date();
    await overviewData.save();

    return {
      success: true,
      data: overviewData,
    };
  } catch (error) {
    console.error('Error updating mission:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCoreValues(coreValuesData) {
  try {
    await connectDB();

    let overviewData = await CompanyOverview.findOne();
    if (!overviewData) {
      overviewData = await CompanyOverview.create(DEFAULT_COMPANY_OVERVIEW);
    }

    overviewData.coreValues = coreValuesData;
    overviewData.updatedAt = new Date();
    await overviewData.save();

    return {
      success: true,
      data: overviewData,
    };
  } catch (error) {
    console.error('Error updating core values:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
