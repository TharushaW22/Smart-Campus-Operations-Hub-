import AddResourceForm from '../components/AddResourceForm'
import RoleSidebarLayout from '../components/RoleSidebarLayout'

export default function AddResourcePage() {
  return (
    <RoleSidebarLayout>
      <div className="min-h-screen bg-gray-50/50">
        <AddResourceForm />
      </div>
    </RoleSidebarLayout>
  )
}
