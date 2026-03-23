import type { Doctor, Patient } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBackend } from "@/hooks/useBackend";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  specialization: "",
  department: "",
  availability: true,
};

const SKELETON_ROWS = ["r1", "r2", "r3", "r4"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6"];

export default function Doctors() {
  const { backend, isLoading: actorLoading } = useBackend();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDoctor, setAssignDoctor] = useState<Doctor | null>(null);
  const [assignPatientId, setAssignPatientId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(() => {
    if (!backend) return;
    setLoading(true);
    Promise.all([backend.getAllDoctors(), backend.getAllPatients()])
      .then(([docs, pats]) => {
        setDoctors(docs);
        setPatients(pats);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [backend]);

  useEffect(() => {
    if (backend && !actorLoading) loadData();
  }, [backend, actorLoading, loadData]);

  const openAdd = () => {
    setEditDoctor(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (d: Doctor) => {
    setEditDoctor(d);
    setForm({
      name: d.name,
      specialization: d.specialization,
      department: d.department,
      availability: d.availability,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in first");
      return;
    }
    if (!backend) {
      toast.error("System is initializing, please try again in a moment.");
      return;
    }
    if (!form.name || !form.specialization) {
      toast.error("Name and specialization are required");
      return;
    }
    setSaving(true);
    try {
      if (editDoctor) {
        await backend.updateDoctor({ ...editDoctor, ...form });
        toast.success("Doctor updated");
      } else {
        await backend.createDoctor({
          id: 0n,
          name: form.name,
          specialization: form.specialization,
          department: form.department,
          availability: form.availability,
          patientIds: [],
          deleted: false,
          lastUpdate: 0n,
        });
        toast.success("Doctor added");
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to save doctor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!backend) return;
    setDeleting(true);
    try {
      await backend.deleteDoctor(id);
      toast.success("Doctor deleted");
      setDeleteId(null);
      loadData();
    } catch {
      toast.error("Failed to delete doctor");
    } finally {
      setDeleting(false);
    }
  };

  const openAssign = (d: Doctor) => {
    setAssignDoctor(d);
    setAssignPatientId("");
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!backend || !assignDoctor || !assignPatientId) {
      toast.error("Select a patient to assign");
      return;
    }
    const pid = BigInt(assignPatientId);
    if (assignDoctor.patientIds.includes(pid)) {
      toast.error("Patient already assigned to this doctor");
      return;
    }
    setAssigning(true);
    try {
      await backend.updateDoctor({
        ...assignDoctor,
        patientIds: [...assignDoctor.patientIds, pid],
      });
      toast.success("Patient assigned");
      setAssignOpen(false);
      loadData();
    } catch {
      toast.error("Failed to assign patient");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isLoggedIn && (
        <div
          data-ocid="doctors.login_warning"
          className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <p className="text-sm font-medium">
            You must be logged in to manage doctors. Use the{" "}
            <span className="font-semibold">Login</span> button in the top-right
            corner.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button
          data-ocid="doctors.add_button"
          onClick={openAdd}
          className="gap-2"
          disabled={!isLoggedIn}
        >
          <Plus className="h-4 w-4" /> Add Doctor
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Patients Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              SKELETON_ROWS.map((rk) => (
                <TableRow key={rk} data-ocid="doctors.table.loading_state">
                  {SKELETON_COLS.map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : doctors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                  data-ocid="doctors.table.empty_state"
                >
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((d, idx) => (
                <TableRow
                  key={String(d.id)}
                  data-ocid={`doctors.item.${idx + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.specialization}</TableCell>
                  <TableCell>{d.department || "—"}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.availability
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.availability ? "Available" : "Unavailable"}
                    </span>
                  </TableCell>
                  <TableCell>{d.patientIds.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        data-ocid={`doctors.assign_button.${idx + 1}`}
                        size="sm"
                        variant="ghost"
                        onClick={() => openAssign(d)}
                        className="h-7 w-7 p-0 text-primary"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        data-ocid={`doctors.edit_button.${idx + 1}`}
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(d)}
                        className="h-7 w-7 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        data-ocid={`doctors.delete_button.${idx + 1}`}
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(d.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="doctors.modal">
          <DialogHeader>
            <DialogTitle>
              {editDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Full Name *</Label>
              <Input
                id="d-name"
                data-ocid="doctors.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="d-spec">Specialization *</Label>
                <Input
                  id="d-spec"
                  data-ocid="doctors.specialization.input"
                  value={form.specialization}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, specialization: e.target.value }))
                  }
                  placeholder="Cardiology"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-dept">Department</Label>
                <Input
                  id="d-dept"
                  data-ocid="doctors.department.input"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                  placeholder="ICU"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="doctors.availability.switch"
                checked={form.availability}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, availability: v }))
                }
              />
              <Label>Available for Appointments</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="doctors.modal.cancel_button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="doctors.modal.submit_button"
              onClick={handleSave}
              disabled={saving || actorLoading || !backend}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editDoctor ? "Update" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="doctors.delete_confirm.dialog"
        >
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this doctor?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="doctors.delete_confirm.cancel_button"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="doctors.delete_confirm.confirm_button"
              disabled={deleting}
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="doctors.assign.dialog"
        >
          <DialogHeader>
            <DialogTitle>Assign Patient — {assignDoctor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Select Patient</Label>
            <Select value={assignPatientId} onValueChange={setAssignPatientId}>
              <SelectTrigger data-ocid="doctors.assign.patient.select">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={String(p.id)} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="doctors.assign.cancel_button"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="doctors.assign.confirm_button"
              onClick={handleAssign}
              disabled={assigning}
            >
              {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
