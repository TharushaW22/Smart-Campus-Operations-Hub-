import EditResourceForm from '../components/EditResourceForm'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

export default function EditResourcePage() {
  return (
    <RoleSidebarLayout>
      <div className="min-h-screen bg-gray-50/50">
        <EditResourceForm />
      </div>
    </RoleSidebarLayout>
  )
}
