import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { getDateRange } from '../helper/helper'; 
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common'; 
import { SendMail } from 'src/helper/email';

@Injectable() 
export class MembersService {
  constructor(
    private prisma: PrismaService, 
    @Inject('REGISTER_SERVICE') private rabbitClient: ClientProxy,
  ) { }
  private readonly logger = new Logger(MembersService.name); 

  // Cron job to send subscription expiry emails
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendSubscriptionExpiryEmails() {
    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(currentDate.getDate() + 7); // Calculate expiry date (7 days from now)

    try {
      const members = await this.prisma.member.findMany({
        include: {
          subscription: true, // Include subscriptions
        },
      });

      for (const member of members) {
        for (const subscription of member.subscription) {
          const { end_date } = subscription;
          let emailContent;
          if (end_date <= expiryDate) {
            // Email content
            emailContent = `
              Dear ${member.last_name},
              Attached is your invoice Please find the details of your charges below:
              Total Amount Due: ${subscription.plan_price}
              Thank you for your business!
              Best regards`;
          }

          // Send email
          const msg = {
            to: `${member.email}`,
            from: process.env.VERIFIED_EMAIL,
            subject: 'invoice',
            html: emailContent,
          }

          // Send email using SendMail function
          const mail = await SendMail(msg);
          if (mail[0].statusCode = 202) {
            this.logger.debug('email sent');
          }
        }
      }

    } catch (error) {
      this.logger.error('Error sending subscription expiry emails:', error);
    }
  }

  // Cron job to check member creation date
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkMemberCreationDate() {
    this.logger.debug('Running cron job to check member creation dates.');

    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    try {
      const members = await this.prisma.member.findMany({
        where: {
          createdAt: {
            gte: oneMonthAgo,
          },
        },
      });

      for (const member of members) {
        // Optional: Update isFirstMonth field if necessary
        if (member.isFirstMonth && new Date(member.createdAt) <= oneMonthAgo) {
          await this.prisma.member.update({
            where: { id: member.id },
            data: { isFirstMonth: false },
          });
          this.logger.log(`Updated Member ID ${member.id} to set isFirstMonth to false.`);
        }
      }
    } catch (error) {
      this.logger.error('Error checking members:', error);
    }
  }

  // Cron job to check subscription statuses
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkSubscriptions() {
    this.logger.debug('Running cron job to check subscription statuses.');

    const currentDate = new Date();

    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          end_date: {
            lte: currentDate,
          },
          status: {
            not: 'DEACTIVATED',
          },
        },
      });

      for (const subscription of subscriptions) {
        // Update subscription status to DEACTIVATED
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'DEACTIVATED' },
        });
        this.logger.log(`Deactivated subscription with ID ${subscription.id}.`);
      }
    } catch (error) {
      this.logger.error('Error checking subscriptions:', error);
    }
  }

  // Method to subscribe user to a package
  async subscribe(subDto) {
    // Check if user exists
    const findUser = await firstValueFrom(this.rabbitClient.send('find-userbyid', { id: subDto.id }))
    if (!findUser) {
      throw new ForbiddenException('user not found');
    }

    // Check if package exists
    const pkg = await this.prisma.package.findUnique({ where: { id: subDto.package_id } });
    if (!pkg) {
      throw new ForbiddenException('package not found');
    }

    // Find existing subscription
    const sub = await this.prisma.subscription.findFirst({ where: { packageId: subDto.package_id, memberId: subDto.id } });
    const packagePlan = pkg.package_plans as { plan_type: string; plan_price: number }[]; // Cast to the appropriate type

    // Get package plan and date range
    let getPackagePlan = packagePlan.find(e => e.plan_type == subDto.plan_type)
    let dateRange = getDateRange(subDto.plan_type)

    if (!sub) {
      // Create new subscription
      await this.prisma.subscription.create({
        data: {
          packageId: subDto.package_id,
          memberId: subDto.id,
          plan_type: subDto.plan_type,
          plan_price: getPackagePlan.plan_price,
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
        }
      });
      return { statusCode: "201", message: "user subscribed successfully" }

    }

    // Update existing subscription
    if (sub && (sub.plan_type !== subDto.plan_type) || (sub.plan_type == subDto.plan_type) && sub.status == 'DEACTIVATED') {
      await this.prisma.subscription.update({
        where: {
          id: sub.id,
        },
        data: {
          plan_type: subDto.plan_type,
          plan_price: getPackagePlan.plan_price,
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
          status: "ACTIVE"
        },
      });
      return { statusCode: "201", message: "user subscribed successfully" }
    }

    throw new ForbiddenException('your subscription is still Active');
  }

  // Method to subscribe a member to a package
  async memberSubscription(data) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);
    let sub_package = await this.prisma.package.findFirst({
      where: {
        package_name: 'Membership',
      }
    });

    // Create subscription for member
    const sub = await this.prisma.subscription.create({
      data: {
        packageId: sub_package.id,
        memberId: data.newMember,
        plan_type: sub_package.package_plans[0].plan_type,
        plan_price: sub_package.package_plans[0].plan_price,
        start_date: startDate,
        end_date: endDate,
      }
    });
    return sub
  }

}
