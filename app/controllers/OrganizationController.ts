import Organization from '#models/organization'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationController {
  // Create a new organization
  public async onboardOrganization(ctx: HttpContext) {
    try {
      const data = ctx.request.only([
        'name', 'email', 'username', 'contact_number', 'subscription_type',
        'subscription_start_date', 'subscription_end_date', 'is_email_verified',
        'status', 'organization_logo', 'established_year', 'address', 'head_name',
        'head_contact_number', 'district', 'city', 'state', 'pincode'
      ])
      const organization = await Organization.create(data)
      return ctx.response.created(organization)
    } catch (error) {
      throw error      
    }
  }

  // get organization details by ID
  public async getOrganizationById(ctx: HttpContext) {
    try {
      const organization = await Organization.findOrFail(ctx.params.id)
      return ctx.response.ok(organization)
    } catch (error) {
      return ctx.response.notFound({ message: 'Organization not found' })
    }
  }

  // Update an organization by ID
  public async updateOrganizationById(ctx: HttpContext) {
    try {
      const organization = await Organization.findOrFail(ctx.params.id)
      const data = ctx.request.only([
        'name', 'email', 'username', 'contact_number', 'subscription_type',
        'subscription_start_date', 'subscription_end_date', 'is_email_verified',
        'status', 'organization_logo', 'established_year', 'address', 'head_name',
        'head_contact_number', 'district', 'city', 'state', 'pincode'
      ])
      organization.merge(data)
      await organization.save()
      return ctx.response.ok(organization)
    } catch (error) {
      return ctx.response.notFound({ message: 'Organization not found' })
    }
  }

  // List all organizations
  public async getAllOrganization(ctx: HttpContext) {
    const organizations = await Organization.all()
    return ctx.response.ok(organizations)
  }
}